
### Database Design: Classified Ads Platform

**Database System:** PostgreSQL (as specified in the PRD)

#### **Schema Overview**

The database schema is designed to be normalized and scalable, accommodating all the features outlined in the PRD, including user management, category hierarchy, ad posting with custom fields, messaging, payments, and affiliate tracking.

---

### **Table Definitions and Relationships**

#### 1. `users`

Stores information about all registered users, including buyers, sellers, agents, and affiliates.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier for each user. |
| `name` | `VARCHAR(255)`| `NOT NULL` | User's full name. |
| `email` | `VARCHAR(255)`| `UNIQUE, NOT NULL` | User's email address. |
| `phone_number`| `VARCHAR(50)` | `UNIQUE, NOT NULL` | User's phone number. |
| `password` | `VARCHAR(255)`| `NOT NULL` | Hashed password for the user. |
| `is_agent` | `BOOLEAN` | `DEFAULT false` | `true` if the user is an agent for educational materials. |
| `is_affiliate`| `BOOLEAN` | `DEFAULT false` | `true` if the user has opted into the affiliate program. |
| `is_verified`| `BOOLEAN` | `DEFAULT false` | `true` if the user is a verified merchant. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Timestamp of user registration. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Timestamp of the last profile update. |

#### 2. `categories`

Stores the hierarchical structure of ad categories and subcategories.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier for each category. |
| `parent_id` | `BIGINT` | `FOREIGN KEY (categories.id)` | The ID of the parent category. `NULL` for primary categories. |
| `name` | `VARCHAR(255)`| `NOT NULL` | The name of the category (e.g., "Electronics", "Laptops"). |
| `icon` | `VARCHAR(255)`| `NULLABLE` | Path or class name for the category's icon. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Timestamp of category creation. |

#### 3. `ads`

The central table for all classified ads.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier for each ad. |
| `user_id` | `BIGINT` | `FOREIGN KEY (users.id)` | The ID of the user who posted the ad (the seller). |
| `category_id`| `BIGINT` | `FOREIGN KEY (categories.id)` | The subcategory this ad belongs to. |
| `title` | `VARCHAR(255)`| `NOT NULL` | The title of the ad. |
| `description`| `TEXT` | `NOT NULL` | Detailed description of the product/service. |
| `price` | `DECIMAL(12, 2)`| `NOT NULL` | The price of the item. |
| `location` | `VARCHAR(255)`| `NOT NULL` | The location of the seller/item. |
| `status` | `VARCHAR(50)` | `DEFAULT 'active'` | Status of the ad (e.g., 'active', 'inactive', 'sold'). |
| `is_boosted` | `BOOLEAN` | `DEFAULT false` | `true` if the ad is currently boosted. |
| `boost_expires_at`| `TIMESTAMP` | `NULLABLE` | The timestamp when the ad boost expires. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Timestamp of ad creation. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Timestamp of the last ad update. |

**Relationships:**
*   `ads.user_id` -> `users.id` (Many-to-One)
*   `ads.category_id` -> `categories.id` (Many-to-One)

#### 4. `ad_custom_fields`

Stores the category-specific data for ads using a flexible key-value structure.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier. |
| `ad_id` | `BIGINT` | `FOREIGN KEY (ads.id)` | The ad this custom field belongs to. |
| `field_name` | `VARCHAR(100)`| `NOT NULL` | The name of the custom field (e.g., 'Color', 'Mileage'). |
| `field_value`| `VARCHAR(255)`| `NOT NULL` | The value for the custom field. |

**Relationships:**
*   `ad_custom_fields.ad_id` -> `ads.id` (Many-to-One)

#### 5. `ad_images`

Stores paths to images associated with an ad.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier. |
| `ad_id` | `BIGINT` | `FOREIGN KEY (ads.id)` | The ad this image belongs to. |
| `image_path` | `VARCHAR(255)`| `NOT NULL` | The path to the stored image file. |
| `is_preview` | `BOOLEAN` | `DEFAULT false` | `true` if this is the main preview image for the ad. |

**Relationships:**
*   `ad_images.ad_id` -> `ads.id` (Many-to-One)

#### 6. `messages`

Stores chat messages for the in-app communication system.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier for each message. |
| `ad_id` | `BIGINT` | `FOREIGN KEY (ads.id)` | The ad this chat is about. |
| `sender_id` | `BIGINT` | `FOREIGN KEY (users.id)` | The user who sent the message. |
| `receiver_id`| `BIGINT` | `FOREIGN KEY (users.id)` | The user who received the message. |
| `message` | `TEXT` | `NOT NULL` | The content of the message. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Timestamp when the message was sent. |

#### 7. `reviews`

Stores user-submitted reviews and ratings for products/sellers.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier for each review. |
| `ad_id` | `BIGINT` | `FOREIGN KEY (ads.id)` | The ad being reviewed. |
| `user_id` | `BIGINT` | `FOREIGN KEY (users.id)` | The user who wrote the review. |
| `rating` | `SMALLINT` | `CHECK (rating >= 1 AND rating <= 5)` | The star rating from 1 to 5. |
| `comment` | `TEXT` | `NULLABLE` | The text content of the review. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Timestamp when the review was submitted. |

#### 8. `payments`

Tracks all transactions on the platform.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Unique identifier for each payment. |
| `user_id` | `BIGINT` | `FOREIGN KEY (users.id)` | The user who made the payment. |
| `payable_id` | `BIGINT` | `NOT NULL` | The ID of the item being paid for. |
| `payable_type`| `VARCHAR(255)`| `NOT NULL` | The type of item (e.g., 'AdBoost', 'EducationalMaterial'). |
| `amount` | `DECIMAL(12, 2)`| `NOT NULL` | The amount paid. |
| `reference` | `VARCHAR(255)`| `NOT NULL` | The transaction reference from Paystack. |
| `status` | `VARCHAR(50)` | `NOT NULL` | The status of the payment (e.g., 'success', 'failed'). |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Timestamp of the transaction. |
