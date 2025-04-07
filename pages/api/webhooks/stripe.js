import Stripe from 'stripe';
import { buffer } from 'micro';
import connectDB from '../../../lib/mongoose'; // Adjust path for connectDB if needed, assuming it's in lib/mongoose
import User from '../../../models/user'; // Adjust path for User model
import Team from '../../../models/team'; // Import Team model
import { logAuditEvent } from '../../../models/auditLog'; // Import audit helper

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Important: Disable Next.js body parsing for this route
// Stripe requires the raw body to verify the webhook signature
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET is not set.');
      return res.status(500).send('Webhook Secret not configured');
  }

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log('✅ Stripe Webhook Event Constructed:', event.type);
  } catch (err) {
    console.error(`❌ Error verifying Stripe webhook signature: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Connect to DB for event handlers
  try {
      await connectDB();
  } catch (dbConnectError) {
      console.error('❌ Failed to connect to DB for webhook handling:', dbConnectError);
      // Return 500 so Stripe retries later when DB might be available
      return res.status(500).send('Database connection failed');
  }

  // Handle the event
  try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const teamId = session.metadata?.teamId; // Get teamId from metadata
          const stripeCustomerId = session.customer;
          const stripeSubscriptionId = session.subscription;

          console.log(`🛒 Checkout completed for Team ID: ${teamId}, Sub ID: ${stripeSubscriptionId}`);

          if (!teamId || !stripeSubscriptionId || !stripeCustomerId) {
            console.error('❌ Missing teamId, subscriptionId, or customerId in checkout session metadata/object.', session);
            // Return 200 because the event is valid, but we can't process it.
            return res.status(200).json({ received: true, message: 'Missing required data in event' });
          }

          // Update the Team with plan and Stripe IDs
          const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { 
              $set: { 
                  plan: 'Pro', // Upgrade plan
                  stripeSubscriptionId: stripeSubscriptionId,
                  stripeCustomerId: stripeCustomerId
                  // promptLimit will be updated by pre-save hook based on plan change
              } 
            },
            { new: true } 
          );

          if (updatedTeam) {
               // --- Audit Log --- 
               await logAuditEvent({
                   userId: session.metadata?.userId, // User who initiated checkout
                   action: 'upgrade_plan',
                   targetType: 'team',
                   targetId: teamId.toString(),
                   details: { 
                       newPlan: 'Pro', 
                       stripeCustomerId: stripeCustomerId, 
                       stripeSubscriptionId: stripeSubscriptionId 
                   }
               });
               // --- End Audit Log ---
               console.log(`✅ Team ${teamId} plan updated to Pro, Sub ID: ${stripeSubscriptionId}`);
          } else {
               console.error(`❌ Team not found for ID: ${teamId} during checkout completion`);
               return res.status(200).json({ received: true, message: 'Team not found' });
          }
          break;
        }

        // Handle subscription updates (e.g., payment failures, cancellations)
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const stripeSubscriptionId = subscription.id;
            const status = subscription.status;
            const isCancelled = event.type === 'customer.subscription.deleted' || subscription.cancel_at_period_end;
            
            console.log(`🔔 Subscription Update: ID: ${stripeSubscriptionId}, Status: ${status}, Cancelled: ${isCancelled}`);

            // If the subscription is no longer active (past_due, unpaid, canceled) or deleted, downgrade the team
            if (status !== 'active' && status !== 'trialing') {
                console.log(`📉 Downgrading team linked to subscription ${stripeSubscriptionId} due to status: ${status}`);
                const updatedTeam = await Team.findOneAndUpdate(
                    { stripeSubscriptionId: stripeSubscriptionId },
                    { 
                        $set: { 
                            plan: 'Free' 
                            // promptLimit updated by pre-save hook
                        },
                        // Optionally clear Stripe IDs if subscription is fully deleted/cancelled?
                        // $unset: { stripeSubscriptionId: "", stripeCustomerId: "" } 
                    },
                    { new: true } 
                );
                if (updatedTeam) {
                     // --- Audit Log --- 
                     await logAuditEvent({
                         userId: null, // Action initiated by Stripe/system
                         action: 'downgrade_plan', // Or 'cancel_subscription' etc.
                         targetType: 'team',
                         targetId: updatedTeam._id.toString(),
                         details: { 
                             newPlan: 'Free', 
                             reason: `Subscription status: ${status}`, 
                             stripeSubscriptionId: stripeSubscriptionId,
                             stripeCustomerId: subscription.customer // Get customer ID from sub object
                          }
                     });
                     // --- End Audit Log ---
                     console.log(`✅ Team ${updatedTeam._id} downgraded to Free.`);
                } else {
                     console.warn(`⚠️ Team not found for subscription ID ${stripeSubscriptionId} during downgrade attempt.`);
                }
            } else {
                 console.log(`Subscription ${stripeSubscriptionId} is still active (${status}). No downgrade needed.`);
            }
            break;
        }
        // Add case for 'invoice.payment_failed' if more immediate action is needed on failure
        // case 'invoice.payment_failed': { ... handle payment failure ... }

        default:
          console.log(`🤷‍♀️ Unhandled Stripe event type: ${event.type}`);
      }
  } catch (dbOrProcessingError) {
      console.error('❌ Error processing webhook event:', dbOrProcessingError);
      // Return 500 so Stripe retries
      return res.status(500).json({ message: 'Error processing webhook event' });
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
} 