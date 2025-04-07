import { getSession } from 'next-auth/react';
import Stripe from 'stripe';
import connectDB from '../../../lib/mongoose'; // Assuming mongoose connection helper path
import Team from '../../../models/team'; // Import Team model
import User from '../../../models/user'; // Import User model for stripeCustomerId

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const proTeamPriceId = process.env.STRIPE_PRO_TEAM_PRICE_ID; // Get Price ID from env

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const nextAuthSession = await getSession({ req });

    if (!nextAuthSession?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = nextAuthSession.user.id;
    const userEmail = nextAuthSession.user.email;
    const { teamId } = req.body; // Expect teamId in the request body

    if (!teamId) {
        return res.status(400).json({ error: 'Team ID is required.' });
    }
    if (!proTeamPriceId) {
        console.error('STRIPE_PRO_TEAM_PRICE_ID is not set in environment variables.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
      await connectDB();

      // 1. Verify user is admin/owner of the team
      const team = await Team.findById(teamId);
      if (!team) {
          return res.status(404).json({ error: 'Team not found.' });
      }
      const member = team.members.find(m => m.user.equals(userId));
      if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
          return res.status(403).json({ error: 'User is not authorized to manage this team\'s subscription.' });
      }
      
      // Check if team is already Pro
      if (team.plan === 'Pro' && team.stripeSubscriptionId) {
         // Optional: Redirect to portal instead? Or just inform?
         return res.status(400).json({ error: 'Team is already on the Pro plan.' });
      }

      // 2. Find or Create Stripe Customer for the USER
      const user = await User.findById(userId).select('stripeCustomerId');
      let stripeCustomerId = user?.stripeCustomerId;

      if (!stripeCustomerId) {
          console.log(`Creating Stripe customer for user ${userId} (${userEmail})`);
          const customer = await stripe.customers.create({ email: userEmail, metadata: { userId: userId } });
          stripeCustomerId = customer.id;
          // Save the new customer ID back to the user document
          await User.findByIdAndUpdate(userId, { stripeCustomerId: stripeCustomerId });
          console.log(`Stripe customer ${stripeCustomerId} created and saved for user ${userId}`);
      } else {
          console.log(`Using existing Stripe customer ${stripeCustomerId} for user ${userId}`);
      }
      
      // Define URLs, include teamId for context on return
      const successUrl = `${req.headers.origin}/teams/${teamId}?checkout=success`;
      const cancelUrl = `${req.headers.origin}/teams/${teamId}?checkout=cancel`;

      // 3. Create Stripe Checkout Session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: proTeamPriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        customer: stripeCustomerId, // Link checkout to the user's Stripe customer ID
        success_url: successUrl,
        cancel_url: cancelUrl,
        // Use metadata to link this checkout session to the specific team
        metadata: {
          teamId: teamId,
          userId: userId // Also store initiating user ID if helpful
        },
        // client_reference_id can also be used, but metadata is more flexible
        // client_reference_id: teamId, 
      });

      console.log(`Stripe Checkout session created for team ${teamId} by user ${userId}`);
      res.status(200).json({ sessionId: checkoutSession.id, url: checkoutSession.url });

    } catch (err) {
      console.error(`Error creating Stripe Checkout session for team ${teamId}:`, err);
      res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
} 