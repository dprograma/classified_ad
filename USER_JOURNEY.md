
# Classified Ads Platform: Comprehensive User Journey

This document outlines the detailed user journeys for the various user roles identified in the Classified Ads Platform PRD.

## **Part 1: The Anonymous Visitor/Guest Journey**

This journey describes the experience of a user who has not created an account or is not logged in.

1.  **Arrival at the Platform:**
    *   The user navigates to the website's homepage.
    *   The user is greeted with a clean, mobile-optimized interface displaying a grid of icons for the primary product categories (e.g., Electronics, Fashion, Real Estate, etc.).

2.  **Exploring Categories:**
    *   The user clicks on a primary category icon, for example, "Electronics".
    *   The page transitions to show the subcategories within Electronics (e.g., Smartphones, Laptops, Tablets).
    *   The user then clicks on a subcategory, for instance, "Laptops".

3.  **Browsing and Discovering Products:**
    *   The user is taken to a product listing page showing all available laptops.
    *   The user can browse through the listings, which display a thumbnail image, title, price, and location for each ad.
    *   The user clicks on a specific laptop ad to view its details.
    *   The ad detail page shows all the information provided by the seller, including multiple images, a detailed description, and the seller's contact information.

4.  **Searching and Filtering:**
    *   Alternatively, from the homepage or a category page, the user can use the search bar to look for a specific item, like "HP Spectre".
    *   The user can filter the search results by location (State/Local Government Area) to narrow down the options.

5.  **Attempting to Interact:**
    *   The user finds an item they are interested in and decides to contact the seller.
    *   The user clicks on the "Show Phone Number" or "Chat" button.
    *   A pop-up or a redirect prompts the user to either **Log In** or **Create an Account** to proceed with contacting the seller, posting a review, or performing any other user-specific action.

## **Part 2: The Registered User (Buyer & Seller) Journey**

This journey covers the experience of a user who has signed up on the platform.

### **A. Registration and Account Management**

1.  **Sign-Up:**
    *   The user clicks on "Sign Up" or "Register".
    *   The user fills out a simple registration form with their name, email, phone number, and a password.
    *   The user completes the registration and is automatically logged in.

2.  **Login:**
    *   A returning user clicks "Log In".
    *   The user enters their email/phone number and password to access their account.

### **B. As a Buyer**

1.  **Contacting a Seller:**
    *   Now logged in, the user browses to an ad they are interested in.
    *   The user can now successfully:
        *   Click to reveal and view the seller's **phone number**.
        *   Click a button to open a **WhatsApp chat** with the seller.
        *   Use the **in-app chat system** to send a message to the seller directly on the platform.

2.  **Leaving Feedback:**
    *   After a successful transaction, the buyer can navigate back to the product page.
    *   The user can leave a **rating** (from 1 to 5 stars) and write a **comment** about their experience with the seller and the product.

3.  **Social Sharing:**
    *   The user finds an interesting ad they want to share.
    *   They click the "Share" button and can post the ad link directly to their **Facebook** or **Instagram** profile.

### **C. As a Seller**

1.  **Posting a New Ad:**
    *   The user clicks on the "Post Ad" button.
    *   The user selects a category and subcategory for their item.
    *   A **customized ad posting form** appears based on the selected category.
        *   **Example (Fashion):** The form asks for Title, Description, Price, Size, Gender, Material, Color, and allows for image uploads.
        *   **Example (Real Estate):** The form includes fields for Location, Property Type, Price, Bedrooms, Bathrooms, and Area (sqm).
    *   The user fills out the form, uploads images, and submits the ad.
    *   The ad is now live on the platform.

2.  **Boosting an Ad:**
    *   To increase visibility, the seller decides to boost their ad.
    *   From their dashboard or the ad page, they click "Boost Ad".
    *   They are presented with boosting options (e.g., 7 days for ₦1,000, 14 days for ₦1,800).
    *   The user selects a package and is redirected to **Paystack** to complete the payment.
    *   Once payment is successful, the ad is marked as "Boosted" and given higher priority in listings.

3.  **Managing Ads:**
    *   The user can go to their personal dashboard to view all the ads they have posted.
    *   From here, they can **edit** the details of an existing ad or **delete** an ad that is no longer available.

## **Part 3: The Agent (Educational Content Seller) Journey**

This journey is for users who sell digital products.

1.  **Becoming an Agent:**
    *   A regular registered user navigates to their profile or a specific section on the site.
    *   They find and click the "Become an Agent" or similar opt-in button.
    *   After agreeing to the terms, their account is upgraded to an Agent account.

2.  **Uploading Educational Material:**
    *   The Agent now has access to a specialized upload interface for the "Education Material" category.
    *   The Agent fills out a form with the product's Title, Description, Price, and File Type.
    *   They upload the actual file (e.g., a PDF of past questions, an ebook) and a preview image.
    *   The uploaded material is submitted for **admin review and approval**.

3.  **The Buyer's Experience (Educational Material):**
    *   A buyer finds the educational material they want to purchase.
    *   They can see the preview image and description but the download button is locked.
    *   The buyer clicks "Buy Now" and is taken to **Paystack** to make the payment.
    *   Upon successful payment, the **download button is unlocked**, and the buyer can download the file.

## **Part 4: The Affiliate Journey**

This journey is for users who want to earn by promoting the platform.

1.  **Becoming an Affiliate:**
    *   A registered user navigates to the "Affiliate Program" section.
    *   They click the "Become Affiliate" button.
    *   The system generates a **unique referral link** for them.

2.  **Promoting the Platform:**
    *   The affiliate shares their referral link on social media, blogs, or with friends.
    *   A new user clicks on this link and is taken to the classified ads platform.

3.  **Earning Commission:**
    *   The referred user makes a purchase (e.g., boosts an ad or buys educational material).
    *   The system tracks this referral. The affiliate earns **65% of the value of the first item purchased** by the referred user.
    *   The affiliate can track their earnings through their affiliate dashboard.

## **Part 5: The Admin Journey**

This journey outlines the tasks performed by the platform administrator.

1.  **Content Management:**
    *   The admin logs into a dedicated admin panel.
    *   The admin can **Create, Read, Update, and Delete (CRUD)** all categories, subcategories, and user-posted listings.
    *   The admin reviews pending educational materials submitted by Agents and can either **approve** or **reject** them.

2.  **User Management:**
    *   The admin can view and manage all user accounts.
    *   The admin is responsible for the **Verification Badge System**. They can verify the identity of Merchants, Agents, and Affiliates (via ID or business proof) and assign a "Verified" badge to their profiles to increase trust.

3.  **Platform Oversight:**
    *   The admin can view **basic user analytics**, such as the number of active users, views per category, and total downloads.
    *   The admin can post **news and information** updates to the platform.
    *   The admin manages the **affiliate payout logic** and reporting, ensuring affiliates are paid correctly.

## **Part 6: The Verified Merchant Journey**

This journey is for sellers who have been officially verified by the platform admin.

1.  **Applying for Verification:**
    *   A registered seller who has posted ads navigates to their profile or a "Trust and Verification" section.
    *   They find an option to "Get Verified".
    *   The user submits required documentation, such as a valid ID or business registration document, through a secure form.
    *   The application is sent to the admin for review.

2.  **Admin Review and Approval:**
    *   The admin receives the verification request.
    *   The admin reviews the submitted documents to confirm the seller's identity and legitimacy.
    *   Upon successful review, the admin approves the request and assigns a "Verified" badge to the user's account.

3.  **The Verified Seller Experience:**
    *   The seller receives a notification that their account is now verified.
    *   A **verification badge** is now displayed next to their profile name on their profile page and on all of their ad listings.
    *   This badge signals trustworthiness to potential buyers, potentially leading to more inquiries and faster sales.

4.  **Buyer's Perspective:**
    *   When a buyer sees an ad from a verified merchant, they see the verification badge.
    *   This gives the buyer more confidence to interact with the seller and make a purchase.

## **Part 7: Security Considerations**

This section outlines the key security measures that must be implemented to protect the platform and its users.

1.  **Authentication and Authorization:**
    *   **Password Security:** All user passwords must be securely hashed using a strong, one-way algorithm (like bcrypt, which is default in Laravel).
    *   **Secure Authentication:** The platform will use Laravel Sanctum or Breeze for API and session authentication, providing protection against session fixation and CSRF attacks.
    *   **Role-Based Access Control (RBAC):** A strict RBAC system will be in place to ensure that users can only access features and data appropriate for their role (e.g., Admin, Agent, User).

2.  **Input Validation and Sanitization:**
    *   **Cross-Site Scripting (XSS) Prevention:** All user-generated content (ad descriptions, reviews, chat messages, profile information) must be properly sanitized before being rendered in the browser to prevent XSS attacks.
    *   **SQL Injection Prevention:** The use of Laravel's Eloquent ORM with parameterized queries will prevent SQL injection vulnerabilities.
    *   **File Upload Validation:** All file uploads (user images, educational materials) must be strictly validated by file type, size, and name to prevent the upload of malicious scripts or executables.

3.  **Payment and Transaction Security:**
    *   **Secure Payment Gateway:** All payment processing is delegated to Paystack, a PCI-DSS compliant payment gateway.
    *   **No Sensitive Data Storage:** The platform will **never** store raw credit card numbers or other sensitive payment details on its servers.

4.  **Secure File Access:**
    *   **Controlled Downloads:** Access to paid educational materials will be protected. Download links should be temporary, single-use, or tied directly to an authenticated user's session to prevent unauthorized sharing and direct URL access.

5.  **API Security:**
    *   **Endpoint Protection:** All API endpoints must be protected by authentication (e.g., JWT or Sanctum tokens) to prevent unauthorized access.
    *   **Rate Limiting:** Implement rate limiting on sensitive endpoints (like login, registration, and ad posting) to protect against brute-force attacks and denial-of-service.

6.  **General Security Best Practices:**
    *   **HTTPS/SSL:** The entire platform must be served over HTTPS to encrypt all data in transit between the user's browser and the server.
    *   **Software Updates:** All frameworks, libraries, and server software (PHP, Laravel, React, etc.) must be kept up-to-date with the latest security patches.
    *   **Error Handling:** Configure the application to not expose sensitive information or system details in error messages in a production environment.
