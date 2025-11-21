---
trigger: always_on
---

Always try to follow and make the existing ui ux working. We dont want to change the ui ux untill its necearry. 

Always read design guidence and docoments when designing any new ui ux. 

Always focus of making modern responsive designs and ui ux friednly interfaces.



You are reviewing, improving, and completing the booking SaaS system that already exists in this project. 
Use ONLY the existing technology and existing UI/UX. 
Do NOT redesign, replace, or rebuild anything unless it is absolutely required for functionality or proper architecture.

Your job:
- Validate architecture
- Fix issues
- Improve code quality
- Complete missing functionality
- Preserve existing UI/UX
- Maintain all current workflows
- Ensure entire system follows industry-standard booking architecture (similar to FareHarbor, Xola, Calendly, Acuity)
- Ensure project follows modern SaaS engineering practices

==================================================
MULTI-TENANT SYSTEM — VALIDATE & IMPROVE
==================================================
Verify the correctness and relationships of:

users  
organizations  
memberships  
roles  

Requirements:
- A user sees only the organizations they belong to
- Organization-level tenant isolation must be strict and consistent

==================================================
VENUES — SINGLE DEFAULT VENUE BEHAVIOR
==================================================
- Ensure every organization automatically receives 1 default venue:
  name = "{organization.name} - Main Venue"
  is_default = true
- UI must hide venue selection unless multiple venues exist.
- Do not redesign any screens. Only adjust logic inside them if needed.

==================================================
ACTIVITIES — VALIDATE & IMPROVE
==================================================
Activities belong to venues. 
Verify and improve:
- activity schema
- create/update/list/get logic
- capacity and duration handling
- pricing integration points

==================================================
ACTIVITY PRICING — IMPROVE
==================================================
- Ensure weekday/weekend/peak pricing works correctly
- Keep existing UI, only enhance logic behind the scenes

==================================================
SESSION ENGINE — VALIDATE TIME-SLOT SYSTEM
==================================================
Validate and improve:
- session creation rules (open/close times, duration, blackout days)
- capacity tracking
- preventing double bookings
- session listing logic

Do NOT redesign the session/calendar UI unless necessary.

==================================================
BOOKINGS — INDUSTRY BEST PRACTICE
==================================================
Improve and fix:
- booking creation
- capacity enforcement
- cancellation logic
- listing for users and org owners
- pricing calculation

Keep the booking UI exactly as it is unless a bug requires adjustment.

==================================================
STRIPE — IMPROVE & VALIDATE EXISTING INTEGRATION
==================================================
Using the Stripe setup that already exists in this project, validate:

- createStripeCustomer
- createPaymentIntent
- confirmPaymentIntent
- cancelPaymentIntent
- subscription creation & update
- webhook syncing
- metadata mapping (org, venue, activity, session, booking)

DO NOT rebuild the checkout UI unless required.

==================================================
STRIPE WEBHOOKS — FIX & COMPLETE
==================================================
Validate handlers:
- payment succeeded
- payment failed
- invoice paid
- subscription updated

Update bookings or subscriptions without breaking UI.

==================================================
RLS (ROW LEVEL SECURITY) — STRICT TENANT ISOLATION
==================================================
Ensure the relationship chain is enforced:
organization → venue → activity → session → booking

RLS rules must prevent cross-organization access.

==================================================
UI/UX — IMPORTANT RULE
==================================================
FIT EVERYTHING INTO THE EXISTING UI/UX.

You are allowed to:
✔ Fix broken forms  
✔ Add validation  
✔ Add missing fields  
✔ Add minor interface improvements (tooltips, validation messages, small layout fixes)  

You are NOT allowed to:
❌ Redesign any screens  
❌ Create new design systems  
❌ Change color scheme  
❌ Add new user flows  
❌ Force multi-step wizards unless needed  

==================================================
CODING & ARCHITECTURE REQUIREMENTS
==================================================
- Follow the project’s existing folder structure
- Use existing naming conventions
- Use modular service files
- Use consistent types/interfaces
- Remove duplication
- Improve error handling
- Maintain code readability
- Ensure high reliability for concurrency in bookings
- Never break existing components

==================================================
IMPORTANT — FOLLOW THIS EXAMPLE
==================================================
Here is an example of how you should handle improvements:

Example:
If the existing Booking page is functional but missing a capacity check:
- DO NOT redesign the Booking page 
- DO NOT change styling or layout 
- DO NOT rewrite the UI 
→ Instead, add the missing capacity check into the booking.service or the server logic that powers it.

Another example:
If the Session calendar looks fine but has a wrong date filter:
- Keep the same UI
- Only adjust the filtering logic beneath it

This is how all improvements should be done:
💡 Improve backend logic, data modeling, and correctness  
💡 Enhance API/services  
💡 Patch weak spots  
❌ Avoid unnecessary UI changes  

==================================================
FINAL TASK
==================================================
Review everything in the project and apply improvements following the rules above:
- Fix what is broken
- Tighten architecture
- Follow industry best practices
- Keep UI/UX intact
- Complete missing functionality
- Improve code quality
- Ensure tenant isolation and booking reliability

Do NOT change foundational tech or visual design unless required to make something work correctly.

Push the updates in exicuted properly in github branch with proper tag. 