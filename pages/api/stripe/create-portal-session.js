import { getSession } from 'next-auth/react';
import Stripe from 'stripe';
import connectDB from '../../../lib/mongoose'; // Adjust path as needed
import Team from '../../../models/team'; // Import Team model

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const nextAuthSession = await getSession({ req });
    if (!nextAuthSession?.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = nextAuthSession.user.id;
    const { teamId } = req.body;

    if (!teamId) {
        return res.status(400).json({ error: 'Team ID is required.' });
    }

    try {
        await connectDB();

        // 1. Verify user is admin/owner of the team and get Stripe customer ID
        const team = await Team.findById(teamId).select('members stripeCustomerId stripeSubscriptionId plan');
        if (!team) {
            return res.status(404).json({ error: 'Team not found.' });
        }
        const member = team.members.find(m => m.user.equals(userId));
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            return res.status(403).json({ error: 'User is not authorized to manage this team\'s billing.' });
        }

        // 2. Check if the team has a Stripe Customer ID (meaning they likely subscribed)
        if (!team.stripeCustomerId) {
            // This could happen if the webhook didn't run or they are on a free plan
            // If they are on Pro without a customer ID, something is wrong.
             if (team.plan === 'Pro') {
                console.error(`Team ${teamId} is Pro but missing Stripe Customer ID.`);
                // Maybe try to find customer via subscription ID if available?
                return res.status(500).json({ error: 'Billing configuration error for this team.' });
            } else {
                return res.status(400).json({ error: 'This team does not have an active subscription to manage.' });
            }
        }

        // 3. Define the return URL (where user goes after portal)
        const returnUrl = `${req.headers.origin}/teams/${teamId}`; 

        // 4. Create a Billing Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: team.stripeCustomerId,
            return_url: returnUrl,
        });
        
        console.log(`Stripe Portal session created for team ${teamId} (Customer: ${team.stripeCustomerId})`);

        // 5. Return the portal session URL
        res.status(200).json({ url: portalSession.url });

    } catch (err) {
        console.error(`Error creating Stripe Portal session for team ${teamId}:`, err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' });
    }
} 