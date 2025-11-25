'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Mail,
  Calendar,
  Gift,
  MessageSquare,
  Star,
  UserPlus,
  XCircle,
  TrendingUp,
  Edit,
  Eye,
  Save,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Send,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { EmailTemplateEditor } from '../components/email/EmailTemplateEditor';

interface EmailTemplate {
  id: string;
  name: string;
  category: 'transactional' | 'marketing' | 'engagement';
  subject: string;
  preheader: string;
  body: string;
  variables: string[];
  icon: any;
  description: string;
  isActive: boolean;
  lastModified: string;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'booking-confirmation',
    name: 'Booking Confirmation',
    category: 'transactional',
    subject: '🎉 Confirmed! Your {{escaperoomName}} Adventure - {{bookingDate}}',
    preheader: 'Your adventure is confirmed! Get ready for an unforgettable experience.',
    body: `Hi {{customerName}},

🎊 Congratulations! Your booking is CONFIRMED and we're absolutely thrilled to host your next unforgettable adventure!

Get ready to test your wits, work as a team, and create memories that will last a lifetime.

🎯 YOUR ADVENTURE DETAILS
━━━━━━━━━━━━━━━━━━━━━━
🎮 Room: {{escaperoomName}}
📅 Date: {{bookingDate}}
⏰ Time: {{bookingTime}} (Please arrive 10 mins early)
⏱️ Duration: {{duration}} minutes of pure excitement
👥 Players: {{playerCount}} brave adventurers
🎫 Confirmation: #{{bookingId}}

📍 FIND US HERE
━━━━━━━━━━━━━━━━━━━━━━
{{businessName}}
{{businessAddress}}
🚗 Free parking available
🗺️ Need directions? Reply to this email!

💡 PREPARE FOR SUCCESS
━━━━━━━━━━━━━━━━━━━━━━
✅ Arrive 10-15 minutes before your time
✅ Wear comfortable clothing & shoes
✅ Bring your thinking caps & team spirit! 🧠
✅ Leave bags, food & sharp objects at home
✅ Age requirement: {{ageRequirement}}+

💳 PAYMENT CONFIRMED
━━━━━━━━━━━━━━━━━━━━━━
Amount Paid: \${{totalAmount}} ✓
Method: {{paymentMethod}}
Status: PAID IN FULL

🎁 BONUS TIPS FOR AN EPIC EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━
• Communication is KEY - talk to your team!
• Search everywhere - no detail is too small
• Think outside the box - creativity wins!
• Have FUN - that's what it's all about! 🎉

Need to reschedule or have questions?
📧 Email: {{supportEmail}}
📞 Call/Text: {{supportPhone}}
We're here to help!

Can't wait to see you escape!

The {{businessName}} Team

P.S. Bringing friends? They get 10% off their next booking when you refer them! Just share your unique code: {{referralCode}} 🎁`,
    variables: ['customerName', 'escaperoomName', 'bookingDate', 'bookingTime', 'duration', 'playerCount', 'bookingId', 'businessName', 'businessAddress', 'totalAmount', 'paymentMethod', 'supportEmail', 'supportPhone', 'ageRequirement', 'referralCode'],
    icon: Calendar,
    description: 'Sent immediately after a successful booking with excitement & key details',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'booking-reminder',
    name: 'Booking Reminder (24hr)',
    category: 'transactional',
    subject: '⏰ Tomorrow! Your {{escaperoomName}} Adventure Awaits',
    preheader: 'Final reminder - Your escape room experience is in 24 hours! Get ready!',
    body: `Hey {{customerName}}! 👋

The moment you've been waiting for is TOMORROW! 🎉

Time to gather your team, charge up your problem-solving skills, and prepare for an adventure you'll never forget!

⏰ YOUR ADVENTURE IS TOMORROW!
━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: {{bookingDate}}
⏰ Time: {{bookingTime}} sharp
🎮 Room: {{escaperoomName}}
👥 Team Size: {{playerCount}} players
🎫 Confirmation: #{{bookingId}}

📍 WHERE TO FIND US
━━━━━━━━━━━━━━━━━━━━━━━━━
{{businessName}}
{{businessAddress}}

🚗 Parking: Free on-site parking available
🗺️ Directions: {{directionsLink}}
⏱️ Plan to arrive: 10-15 minutes early

🎒 WHAT TO BRING
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Your booking confirmation (this email!)
✅ Comfortable clothing & closed-toe shoes
✅ Your A-game! 🧠
✅ Positive vibes & team spirit 💪
✅ A fully charged phone (for photos after!)

⚠️ PLEASE DON'T BRING
━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Food or drinks (water bottles OK)
❌ Large bags or backpacks
❌ Flashlights or tools (we provide everything!)

🔥 PRO TIPS FROM OUR GAME MASTERS
━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Arrive early - Extra time = Less stress
🗣️ Communicate constantly - Every clue matters
👀 Search thoroughly - Check everywhere!
🤝 Divide & conquer - Split up to solve faster
🎯 Stay organized - Keep track of what you find
😊 Most importantly: HAVE FUN!

⚡ LAST-MINUTE PREP
━━━━━━━━━━━━━━━━━━━━━━━━━
🚽 Use the restroom before starting
🔕 Set phones to silent
👂 Listen carefully to the pre-game briefing
🤔 Ask questions if anything is unclear

📞 RUNNING LATE OR NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━
Call/Text: {{supportPhone}}
Email: {{supportEmail}}
We're here to help!

💰 Already paid? Yes! You're all set.
📋 Need to add players? Call us ASAP.
🔄 Need to reschedule? Contact us immediately.

🎊 GET EXCITED!
━━━━━━━━━━━━━━━━━━━━━━━━━
You're about to experience {{escaperoomName}}, one of our most thrilling adventures! Past teams have rated it {{roomRating}}/5 stars. Can you beat the clock and escape?

See you tomorrow, adventurer! 🚀

The {{businessName}} Team

P.S. Tag us in your post-game photos on social media! Use #{{socialHashtag}} to share your victory (or near-miss!) 📸✨`,
    variables: ['customerName', 'escaperoomName', 'bookingDate', 'bookingTime', 'playerCount', 'bookingId', 'businessAddress', 'directionsLink', 'supportPhone', 'supportEmail', 'businessName', 'roomRating', 'socialHashtag'],
    icon: Clock,
    description: 'Sent 24 hours before booking with complete preparation guide',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'waiver-request',
    name: 'Digital Waiver Request',
    category: 'transactional',
    subject: '📋 Quick Action Required: Sign Your Waiver for {{escaperoomName}}',
    preheader: 'Complete your digital waiver before your visit - takes only 2 minutes!',
    body: `Hi {{customerName}}!

You're confirmed for {{escaperoomName}} on {{bookingDate}} at {{bookingTime}}! 🎉

To make your check-in super quick and easy, please complete your digital waiver before you arrive.

📋 COMPLETE YOUR WAIVER NOW
━━━━━━━━━━━━━━━━━━━━━━━━━
{{waiverLink}}

⏱️ Takes only 2 minutes!
✅ Sign once for your entire group
📱 Works on any device
🔒 Secure & encrypted

🎯 WHY SIGN NOW?
━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Skip the paperwork at check-in
⚡ Get into your adventure faster
🕐 More time for fun, less time waiting
📝 Easy to review and understand

👥 SIGNING FOR YOUR GROUP?
━━━━━━━━━━━━━━━━━━━━━━━━━
If you're the group leader for {{playerCount}} players, you can:
• Sign for all adult participants (18+)
• Add guardian signatures for minors
• Update player information easily

⚠️ WHAT THE WAIVER COVERS
━━━━━━━━━━━━━━━━━━━━━━━━━
• Standard liability release
• Photography consent (optional)
• Medical disclosure
• House rules agreement
• Contact information verification

📍 YOUR BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
Room: {{escaperoomName}}
Date: {{bookingDate}}
Time: {{bookingTime}}
Location: {{businessAddress}}
Booking ID: #{{bookingId}}

🔒 PRIVACY & SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━
Your information is:
• Stored securely with 256-bit encryption
• Never shared with third parties
• Used only for your booking
• Compliant with privacy regulations

📞 QUESTIONS OR CONCERNS?
━━━━━━━━━━━━━━━━━━━━━━━━━
• Can't access the form? Call {{supportPhone}}
• Have medical concerns? Email {{supportEmail}}
• Need modifications? We're happy to help!
• Technical issues? We'll walk you through it

💡 DIDN'T RECEIVE THE WAIVER LINK?
━━━━━━━━━━━━━━━━━━━━━━━━━
1. Check your spam/junk folder
2. Add us to your contacts
3. Can't find it? Reply to this email

✨ COMPLETE YOUR WAIVER = SMOOTHER EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━
Groups that sign waivers in advance spend 8 minutes less at check-in on average. That's 8 more minutes to get excited and strategize! 🎯

👉 Sign Your Waiver Now: {{waiverLink}}

Looking forward to your adventure!

The {{businessName}} Team

P.S. Already signed? You're all set! Ignore this reminder and see you on {{bookingDate}}! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━
Need help? Reply to this email or call {{supportPhone}}
{{businessName}} | {{businessAddress}}`,
    variables: ['customerName', 'escaperoomName', 'bookingDate', 'bookingTime', 'waiverLink', 'playerCount', 'businessAddress', 'bookingId', 'supportPhone', 'supportEmail', 'businessName'],
    icon: MessageSquare,
    description: 'Sent after booking to request digital waiver signature',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'referral-program',
    name: 'Referral Rewards Program',
    category: 'marketing',
    subject: '💰 Earn $20 for Every Friend! Share the Escape Room Love',
    preheader: 'Turn your love for escape rooms into rewards - Give $20, Get $20!',
    body: `Hey {{customerName}}! 👋

We noticed you're an AMAZING customer and we want to reward you for spreading the word about {{businessName}}!

Introducing our NEW Referral Rewards Program - where EVERYONE wins! 🎊

💎 HERE'S HOW IT WORKS (IT'S SIMPLE!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ Share your unique code with friends
2️⃣ They get $20 OFF their first booking 🎁
3️⃣ They complete their adventure
4️⃣ You get $20 CREDIT instantly! 💰

🔥 UNLIMITED EARNING POTENTIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Refer 5 friends = $100 in credits
Refer 10 friends = $200 in credits
Refer 20 friends = $400 in credits
NO LIMITS! Keep earning! 🚀

🔗 YOUR EXCLUSIVE REFERRAL TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Personal Code: {{referralCode}}
Direct Link: {{referralLink}}
Share Page: {{referralSharePage}}

Just copy and share - that's it!

📱 SHARE YOUR LINK EVERYWHERE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Text to friends: "Check out this escape room! Use my code {{referralCode}} for $20 off!"
📧 Email to family members
📘 Facebook, Instagram, TikTok posts
💼 Share with coworkers (team building!)
🎉 Birthday & event planning groups
👥 Local community boards

💰 YOUR REFERRAL DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Friends Referred: {{referralCount}}🎯
Total Credits Earned: \${{creditsEarned}}💵
Current Balance: \${{availableBalance}}✨
Pending Referrals: {{pendingReferrals}}

🎁 WHAT YOU CAN DO WITH CREDITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Book any escape room
✅ Bring more friends (bigger team!)
✅ Try our premium experiences
✅ Gift to someone special
✅ Stack with other promotions!

⚡ SPECIAL REFERRAL BONUSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Refer 3 friends this month = Extra $10 bonus
Refer 5 friends = VIP member upgrade
Refer 10 friends = FREE private room booking!

🏆 TOP REFERRERS THIS MONTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇 Sarah M. - 23 referrals, $460 earned!
🥈 Mike R. - 18 referrals, $360 earned!
🥉 Emma T. - 15 referrals, $300 earned!

Could you be next month's champion? 🏅

💡 TIPS TO MAXIMIZE YOUR EARNINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Post about your experience with photos
💬 Share your escape time & success story
🎥 Record a fun reaction video
🎨 Create a review with highlights
👥 Tag us on social! @{{socialHandle}}

📊 TRACK YOUR IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Friends who booked: {{friendsBooked}}
Total savings given: \${{totalSavingsGiven}}
Adventures created: {{adventuresCreated}}

You're not just earning rewards - you're creating unforgettable memories for others! ❤️

🎉 WHY YOUR FRIENDS WILL LOVE IT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ Rated {{averageRating}}/5 stars
✅ {{totalReviews}}+ happy customers
🏆 Award-winning escape rooms
🎭 Professional game masters
📸 Instagram-worthy experiences
🎊 Perfect for any occasion!

🔒 PROGRAM TERMS (THE GOOD STUFF)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Credits NEVER expire
✅ Can be combined with other offers
✅ Unlimited referrals allowed
✅ Credits transferable to friends
✅ Automatic tracking & rewards
✅ Instant credit after friend's visit

📞 QUESTIONS?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• How do I track referrals? Check your account dashboard
• When do I get credited? Within 24 hours of friend's visit
• Can I refer family? Absolutely! Everyone's welcome
• Credits stackable? Yes! Use multiple at once

🚀 START EARNING TODAY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your unique link: {{referralLink}}

Copy, share, earn, repeat! 💪

Thank you for being part of the {{businessName}} family!

The {{businessName}} Team

P.S. The top 3 referrers each quarter win a FREE GROUP BOOKING for up to 8 people! Worth $200+! Start sharing now! 🎁🏆

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Share your code: {{referralCode}}
Track rewards: {{dashboardLink}}
Questions? {{supportEmail}} | {{supportPhone}}`,
    variables: ['customerName', 'referralCode', 'referralLink', 'referralCount', 'creditsEarned', 'availableBalance', 'businessName', 'referralSharePage', 'pendingReferrals', 'friendsBooked', 'totalSavingsGiven', 'adventuresCreated', 'averageRating', 'totalReviews', 'socialHandle', 'dashboardLink', 'supportEmail', 'supportPhone'],
    icon: Gift,
    description: 'High-converting referral program email with unlimited earning potential',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    category: 'engagement',
    subject: 'Welcome to {{businessName}}! Your Adventure Awaits 🎉',
    preheader: 'Thanks for signing up! Here\'s what you need to know.',
    body: `Hi {{customerName}},

Welcome to {{businessName}}! We're thrilled to have you join our community of escape room enthusiasts.

🎯 WHAT'S NEXT?
━━━━━━━━━━━━━━━━
1. Browse our {{roomCount}} unique escape rooms
2. Choose your difficulty level
3. Book your preferred time slot
4. Gather your team (2-{{maxPlayers}} players)
5. Get ready for an unforgettable experience!

⭐ OUR MOST POPULAR ROOMS
━━━━━━━━━━━━━━━━
1. {{popularRoom1}} - {{difficulty1}}
2. {{popularRoom2}} - {{difficulty2}}
3. {{popularRoom3}} - {{difficulty3}}

🎁 FIRST-TIME OFFER
━━━━━━━━━━━━━━━━
Use code: WELCOME20
Get 20% off your first booking
Valid for 30 days

💡 PRO TIPS
━━━━━━━━━━━━━━━━
• Book during weekdays for better availability
• Bigger teams are more fun (4-6 players ideal)
• Read the room descriptions carefully
• Arrive early for the full experience

📍 FIND US
━━━━━━━━━━━━━━━━
{{businessAddress}}
Hours: {{businessHours}}
Phone: {{supportPhone}}

Ready to escape? Book your first adventure now!

{{businessName}} Team

P.S. Follow us on social media for behind-the-scenes content and special offers! {{socialLinks}}`,
    variables: ['customerName', 'businessName', 'roomCount', 'maxPlayers', 'popularRoom1', 'difficulty1', 'popularRoom2', 'difficulty2', 'popularRoom3', 'difficulty3', 'businessAddress', 'businessHours', 'supportPhone', 'socialLinks'],
    icon: UserPlus,
    description: 'Sent when a new customer signs up',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'review-request',
    name: 'Review Request',
    category: 'engagement',
    subject: '⭐ Loved {{escaperoomName}}? Share Your Experience! (2 min)',
    preheader: 'Your review helps others discover amazing adventures + you get 20% off!',
    body: `Hey {{customerName}}! 🎉

We hope you LOVED your {{escaperoomName}} experience at {{businessName}}!

Your adventure stats were impressive! 📊
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{escapeStatus}}
⏱️ Completion Time: {{completionTime}}
👥 Team: {{teamName}}
🎯 Success Rate: {{successRate}}%

If you had a blast, we'd be so grateful if you could share your experience with others! 🙏

⭐ LEAVE A QUICK REVIEW (CHOOSE YOUR PLATFORM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Google (Most Impactful!)
👉 {{googleReviewLink}}
⏱️ Takes 60 seconds

📘 Facebook
👉 {{facebookReviewLink}}
⏱️ Takes 60 seconds

✈️ TripAdvisor
👉 {{tripadvisorReviewLink}}
⏱️ Takes 90 seconds

🎁 YOUR REWARD FOR REVIEWING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leave a review on ANY platform above and get:
✨ 20% OFF your next booking (code: REVIEW20)
🎟️ Priority booking for new room launches
🎁 Entry to win a $200 gift certificate
⭐ VIP reviewer badge on your profile

Just forward us your review screenshot to {{supportEmail}} and we'll send your discount code within 24 hours!

💡 WHAT TO INCLUDE IN YOUR REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Which room you played ({{escaperoomName}})
✓ Did you enjoy the puzzles?
✓ How was your game master?
✓ Would you recommend it?
✓ Any fun photos? Upload them! 📸

🎯 WHY YOUR REVIEW MATTERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 Helps other adventurers choose the right room
👥 Supports our small business growth
📈 Lets us know what you loved (and what to improve!)
🏆 Celebrates our amazing game masters
💪 Strengthens our local community

⚡ QUICK COPY-PASTE REVIEW TEMPLATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feel free to use/customize this:

"Just completed {{escaperoomName}} at {{businessName}}! {{escapeStatus}} in {{completionTime}}. The puzzles were [describe], our game master [name if you remember] was fantastic, and we had a blast! Highly recommend for [groups/couples/families]. Already planning our next visit! ⭐⭐⭐⭐⭐"

📸 SHARE YOUR PHOTOS TOO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tag us on social media for a feature!
Instagram: @{{socialHandle}}
Facebook: {{facebookHandle}}
Use hashtag: #{{locationHashtag}}

Best photo each month wins a FREE booking! 🏆📷

🎊 MORE ROOMS TO CONQUER?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You've experienced {{escaperoomName}}. Ready for more?

Still to try:
{{remainingRoom1}} - {{remainingRoom1Difficulty}}
{{remainingRoom2}} - {{remainingRoom2Difficulty}}
{{remainingRoom3}} - {{remainingRoom3Difficulty}}

Book your next adventure: {{bookingLink}}

💬 YOUR WORDS INSPIRE OTHERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reviews from customers like you helped {{reviewsHelped}} people choose their perfect escape room last month! Your voice matters! ❤️

🏅 HALL OF FAME REVIEWERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This month's top reviewers:
🥇 {{topReviewer1}} - Reviewed 4 platforms!
🥈 {{topReviewer2}} - Epic 5-star review!
🥉 {{topReviewer3}} - Amazing photos shared!

Could you be next month's MVP? 🌟

📝 PREFER TO SEND PRIVATE FEEDBACK?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
That's cool too! Email us at {{supportEmail}} with:
• What you loved
• What could be better
• Ideas for new rooms
• Special requests

We read and respond to EVERY message! 💌

👉 LEAVE YOUR REVIEW NOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Google: {{googleReviewLink}}
Facebook: {{facebookReviewLink}}
TripAdvisor: {{tripadvisorReviewLink}}

Then email your screenshot to {{supportEmail}} for your 20% OFF code!

Thank you for being an awesome customer! 🙌

The {{businessName}} Team

P.S. Know someone who'd love escape rooms? Refer them with code {{referralCode}} - they save $20 and you earn $20 in credits! Win-win! 🎁

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? {{supportEmail}} | {{supportPhone}}
Book again: {{bookingLink}}`,
    variables: ['customerName', 'escaperoomName', 'businessName', 'escapeStatus', 'completionTime', 'teamName', 'successRate', 'googleReviewLink', 'facebookReviewLink', 'tripadvisorReviewLink', 'supportEmail', 'socialHandle', 'facebookHandle', 'locationHashtag', 'remainingRoom1', 'remainingRoom1Difficulty', 'remainingRoom2', 'remainingRoom2Difficulty', 'remainingRoom3', 'remainingRoom3Difficulty', 'bookingLink', 'reviewsHelped', 'topReviewer1', 'topReviewer2', 'topReviewer3', 'referralCode', 'supportPhone'],
    icon: Star,
    description: 'High-converting review request with incentives and social proof',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'post-visit-survey',
    name: 'Post-Visit Feedback Survey',
    category: 'engagement',
    subject: '📋 Quick Feedback: How Was {{escaperoomName}}? (Earn 15% Off!)',
    preheader: '2-minute survey + 15% discount code + chance to win FREE booking!',
    body: `Hi {{customerName}}! 👋

Thanks for conquering {{escaperoomName}} with us! We hope it was EPIC! 🎉

Your experience details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 Room: {{escaperoomName}}
📅 Date: {{visitDate}}
{{escapeStatus}}
⏱️ Time: {{completionTime}}
👥 Team: {{teamName}}

We'd love to hear about your adventure! 🎯

📝 TAKE OUR 2-MINUTE SURVEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 {{surveyLink}}

Quick questions we'll ask:
✓ How challenging was the room? (1-5)
✓ How was your game master? (1-5)
✓ Puzzle quality rating (1-5)
✓ Would you recommend us? (Yes/No)
✓ What did you love most?
✓ Any suggestions for improvement?

That's it! Takes 2 minutes max! ⏱️

🎁 SURVEY COMPLETION REWARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Complete the survey and instantly get:

1️⃣ 15% OFF your next booking 💰
   Code delivered instantly!

2️⃣ Early Access Pass 🎟️
   Be first to book new rooms before public launch

3️⃣ Prize Draw Entry 🎉
   Monthly winner gets a FREE private room ($200 value!)

4️⃣ VIP Insights 💎
   Get notified of exclusive offers first

💡 WHY YOUR FEEDBACK IS GOLD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your honest feedback helps us:
🎯 Design better puzzles
👥 Train our game masters
✨ Improve the overall experience
🏆 Know what we're doing right!
🔧 Fix what needs fixing

📊 SEE HOW YOU COMPARED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Room: {{escaperoomName}}
Your Time: {{completionTime}}
Average Time: {{averageCompletionTime}}
Success Rate: {{roomSuccessRate}}%
Your Status: {{escapeStatus}}

{{comparisonMessage}}

🎮 COMPLETED ROOMS TRACKER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Rooms Played: {{totalRoomsPlayed}}/{{totalRoomsAvailable}}
Escape Success Rate: {{playerEscapeRate}}%
Total Time Played: {{totalTimeSpent}} mins
Favorite Difficulty: {{favoriteDifficulty}}

Ready to try another room? {{bookingLink}}

⭐ WANT TO LEAVE A PUBLIC REVIEW TOO?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We'd be forever grateful! Choose your platform:
• Google: {{googleReviewLink}}
• Facebook: {{facebookReviewLink}}
• TripAdvisor: {{tripadvisorReviewLink}}

Bonus: Screenshot your public review and email it to {{supportEmail}} for an EXTRA 5% off! (Total 20% off!) 🎁

🏆 THIS MONTH'S SURVEY HIGHLIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Most Loved Room: {{mostLovedRoom}}
Highest Rated Game Master: {{topGameMaster}}
Best Comment: "{{bestComment}}"

Could your feedback be featured next month? ✨

❓ HAVE SPECIFIC CONCERNS?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The survey is anonymous, but if you want a direct response:
📧 Email: {{supportEmail}}
📞 Call: {{supportPhone}}

We read every message and respond within 24 hours! 💌

🎯 READY TO SHARE YOUR THOUGHTS?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👉 Take Survey Now: {{surveyLink}}
⏱️ 2 minutes • 15% OFF • Prize entry

Thanks for making {{businessName}} better!

The {{businessName}} Team

P.S. Bring friends next time! Use referral code {{referralCode}} - they get $20 off, you earn $20 in credits! 💰

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Take survey: {{surveyLink}}
Book again: {{bookingLink}}
Questions? {{supportEmail}} | {{supportPhone}}`,
    variables: ['customerName', 'escaperoomName', 'visitDate', 'escapeStatus', 'completionTime', 'teamName', 'surveyLink', 'averageCompletionTime', 'roomSuccessRate', 'comparisonMessage', 'totalRoomsPlayed', 'totalRoomsAvailable', 'playerEscapeRate', 'totalTimeSpent', 'favoriteDifficulty', 'bookingLink', 'googleReviewLink', 'facebookReviewLink', 'tripadvisorReviewLink', 'supportEmail', 'mostLovedRoom', 'topGameMaster', 'bestComment', 'supportPhone', 'businessName', 'referralCode'],
    icon: MessageSquare,
    description: 'Detailed feedback survey with gamification and instant rewards',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'cancellation-confirmation',
    name: 'Cancellation Confirmation',
    category: 'transactional',
    subject: 'Booking Cancelled - We Hope to See You Soon',
    preheader: 'Your cancellation has been processed. Here are the details.',
    body: `Hi {{customerName}},

We've processed your cancellation request. While we're sad to see you cancel, we understand plans change.

❌ CANCELLATION DETAILS
━━━━━━━━━━━━━━━━
Booking ID: #{{bookingId}}
Room: {{escaperoomName}}
Original Date: {{bookingDate}}
Original Time: {{bookingTime}}
Cancelled On: {{cancellationDate}}

💰 REFUND INFORMATION
━━━━━━━━━━━━━━━━
Refund Amount: \${{refundAmount}}
Processing Time: {{refundProcessingTime}}
Method: {{refundMethod}}
Expected By: {{expectedRefundDate}}

{{cancellationPolicy}}

📅 WANT TO RESCHEDULE INSTEAD?
━━━━━━━━━━━━━━━━
We'd love to see you! Book a new time:
• No rebooking fees
• Same room or choose a different one
• Flexible date options

Use code: COMEBACK10 for 10% off your rescheduled booking!

🎯 OTHER WAYS WE CAN HELP
━━━━━━━━━━━━━━━━
• Transfer to a friend (no charge)
• Store credit for future use
• Gift certificate option

Questions about your cancellation? Contact us at {{supportEmail}} or {{supportPhone}}.

We hope to see you soon!
{{businessName}} Team

P.S. Check out our new rooms launching next month! {{newRoomsLink}}`,
    variables: ['customerName', 'bookingId', 'escaperoomName', 'bookingDate', 'bookingTime', 'cancellationDate', 'refundAmount', 'refundProcessingTime', 'refundMethod', 'expectedRefundDate', 'cancellationPolicy', 'supportEmail', 'supportPhone', 'businessName', 'newRoomsLink'],
    icon: XCircle,
    description: 'Sent when a booking is cancelled',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'win-back-campaign',
    name: 'Win-Back Campaign',
    category: 'marketing',
    subject: 'We Miss You! Come Back for 25% Off 💙',
    preheader: 'It\'s been a while! Here\'s a special offer just for you.',
    body: `Hi {{customerName}},

We noticed it's been {{daysSinceLastVisit}} days since your last escape room adventure with us. We miss you! 💙

🎁 WELCOME BACK OFFER
━━━━━━━━━━━━━━━━
25% OFF YOUR NEXT BOOKING
Code: WELCOMEBACK25
Valid for: {{offerValidDays}} days

✨ WHAT'S NEW SINCE YOUR LAST VISIT
━━━━━━━━━━━━━━━━
{{newFeature1}}
{{newFeature2}}
{{newFeature3}}

🔥 NEW ROOMS YOU HAVEN'T TRIED
━━━━━━━━━━━━━━━━
1. {{newRoom1}} - {{newRoom1Description}}
2. {{newRoom2}} - {{newRoom2Description}}
3. {{newRoom3}} - {{newRoom3Description}}

⭐ YOUR STATS
━━━━━━━━━━━━━━━━
Total Rooms Completed: {{totalRoomsCompleted}}
Escape Rate: {{escapeRate}}%
Fastest Escape: {{fastestEscape}} minutes
Rooms Not Tried: {{roomsNotTried}}

🎯 WHY COME BACK?
━━━━━━━━━━━━━━━━
• Updated rooms with new puzzles
• Improved technology
• Better clue system
• New staff-favorite challenges
• Enhanced booking experience

💡 LIMITED TIME OFFER
━━━━━━━━━━━━━━━━
This 25% discount expires in {{offerValidDays}} days!
Don't miss out on our best rooms.

Book now and rediscover the thrill!

{{businessName}} Team

P.S. Bring friends who haven't been before and they get 20% off too! Use code FRIENDSBACK20.`,
    variables: ['customerName', 'daysSinceLastVisit', 'offerValidDays', 'newFeature1', 'newFeature2', 'newFeature3', 'newRoom1', 'newRoom1Description', 'newRoom2', 'newRoom2Description', 'newRoom3', 'newRoom3Description', 'totalRoomsCompleted', 'escapeRate', 'fastestEscape', 'roomsNotTried', 'businessName'],
    icon: TrendingUp,
    description: 'Re-engage customers who haven\'t visited recently',
    isActive: true,
    lastModified: new Date().toISOString()
  }
];

export default function EmailTemplates() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme classes
  const bgPrimary = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const bgSecondary = isDark ? 'bg-[#161616]' : 'bg-gray-50';
  const bgTertiary = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const hoverBg = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'transactional' | 'marketing' | 'engagement'>('all');

  // Load templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('emailTemplates');
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    }
  }, []);

  // Save templates to localStorage
  const saveTemplates = (updatedTemplates: EmailTemplate[]) => {
    localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSaveTemplate = (updatedTemplate: EmailTemplate) => {
    const updatedTemplates = templates.map(t =>
      t.id === updatedTemplate.id ? { ...updatedTemplate, lastModified: new Date().toISOString() } : t
    );
    saveTemplates(updatedTemplates);
    setIsEditing(false);
    setSelectedTemplate(null);
    toast.success('Template saved successfully');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const handleToggleActive = (templateId: string) => {
    const updatedTemplates = templates.map(t =>
      t.id === templateId ? { ...t, isActive: !t.isActive } : t
    );
    saveTemplates(updatedTemplates);
    toast.success(updatedTemplates.find(t => t.id === templateId)?.isActive ? 'Template activated' : 'Template deactivated');
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleSendTest = (template: EmailTemplate) => {
    toast.success(`Test email sent for "${template.name}"`);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'transactional':
        return isDark ? 'bg-blue-950/50 text-blue-300 border-blue-900' : 'bg-blue-100 text-blue-700 border-blue-200';
      case 'marketing':
        return isDark ? 'bg-purple-950/50 text-purple-300 border-purple-900' : 'bg-purple-100 text-purple-700 border-purple-200';
      case 'engagement':
        return isDark ? 'bg-green-950/50 text-green-300 border-green-900' : 'bg-green-100 text-green-700 border-green-200';
      default:
        return isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const stats = [
    {
      label: 'Total Templates',
      value: templates.length,
      icon: Mail,
      color: 'text-blue-500'
    },
    {
      label: 'Active Templates',
      value: templates.filter(t => t.isActive).length,
      icon: Check,
      color: 'text-green-500'
    },
    {
      label: 'Categories',
      value: 3,
      icon: Sparkles,
      color: 'text-purple-500'
    },
    {
      label: 'Avg. Open Rate',
      value: '68%',
      icon: TrendingUp,
      color: 'text-indigo-500'
    }
  ];

  if (isEditing && selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleCancelEdit}
            className={isDark ? 'text-white hover:bg-[#1e1e1e]' : ''}
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Templates
          </Button>
        </div>
        <EmailTemplateEditor
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  const handleUseTemplate = (template: EmailTemplate) => {
    // Activate the template
    const updatedTemplates = templates.map(t =>
      t.id === template.id ? { ...t, isActive: true } : t
    );
    saveTemplates(updatedTemplates);
    toast.success(`"${template.name}" is now active and ready to use!`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        description="Pre-built email templates"
        sticky
      />

      {/* Simple List View */}
      <Card className={`${cardBg} border ${borderColor}`}>
        <CardHeader className="p-6">
          <CardTitle className={textPrimary}>Email Templates</CardTitle>
          <CardDescription className={textSecondary}>Pre-built email templates</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-[#2a2a2a]">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className={`flex items-center justify-between p-6 ${hoverBg} transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'} flex items-center justify-center`}>
                      <Mail className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <div>
                      <h3 className={`${textPrimary}`}>{template.name}</h3>
                      {template.isActive && (
                        <Badge className="mt-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(template)}
                      className={isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className={isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      disabled={template.isActive}
                      className={`${isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} ${template.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {template.isActive ? 'In Use' : 'Use Template'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>



      {/* Preview Modal */}
      {selectedTemplate && !isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className={`${cardBg} border ${borderColor} w-full max-w-2xl max-h-[90vh] overflow-auto`}>
            <CardHeader className="p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
              <div className="flex items-center justify-between">
                <CardTitle className={textPrimary}>Preview: {selectedTemplate.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className={`text-sm ${textSecondary} mb-2 block`}>Subject</Label>
                <p className={`text-sm ${textPrimary} font-medium`}>{selectedTemplate.subject}</p>
              </div>
              <div>
                <Label className={`text-sm ${textSecondary} mb-2 block`}>Preheader</Label>
                <p className={`text-sm ${textPrimary}`}>{selectedTemplate.preheader}</p>
              </div>
              <div>
                <Label className={`text-sm ${textSecondary} mb-2 block`}>Email Body</Label>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} whitespace-pre-wrap text-sm ${textPrimary}`}>
                  {selectedTemplate.body}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
