<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Electronics',
                'subcategories' => ['Smartphones', 'Laptops', 'Tablets', 'Smartwatches', 'Gaming Consoles', 'Others']
            ],
            [
                'name' => 'Fashion',
                'subcategories' => ["Men's Clothing", "Women's Clothing", "Kids' Clothing", 'Footwear', 'Accessories', 'Others']
            ],
            [
                'name' => 'Home and Kitchen',
                'subcategories' => ['Furniture', 'Decor', 'Kitchen Appliances', 'Bed and Bath', 'Outdoor Living', 'Others']
            ],
            [
                'name' => 'Beauty and Personal Care',
                'subcategories' => ['Skincare', 'Haircare', 'Makeup', 'Fragrances', 'Wellness and Health', 'Others']
            ],
            [
                'name' => 'Sports and Outdoors',
                'subcategories' => ['Fitness Equipment', 'Team Sports', 'Outdoor Gear', 'Camping and Hiking', 'Cycling', 'Others']
            ],
            [
                'name' => 'Toys and Games',
                'subcategories' => ['Action Figures', 'Dolls', 'Board Games', 'Puzzles', 'Outdoor Toys', 'Others']
            ],
            [
                'name' => 'Books and Media',
                'subcategories' => ['Fiction Books', 'Non-Fiction Books', 'Music', 'Movies', 'TV Shows', 'Others']
            ],
            [
                'name' => 'Health and Wellness',
                'subcategories' => ['Supplements', 'Fitness and Exercise', 'Healthy Snacks', 'Medical Equipment', 'Wellness Products', 'Others']
            ],
            [
                'name' => 'Baby and Kids',
                'subcategories' => ['Strollers', 'Car Seats', 'Toys', 'Clothing', 'Nursery Furniture', 'Others']
            ],
            [
                'name' => 'Pet Care',
                'subcategories' => ['Food', 'Toys', 'Treats', 'Grooming', 'Health and Wellness', 'Others']
            ],
            [
                'name' => 'Real Estate',
                'subcategories' => ['Apartments for Rent', 'Houses for Sale', 'Commercial Properties', 'Land for Sale', 'Others']
            ],
            [
                'name' => 'Vehicles',
                'subcategories' => ['Cars', 'Trucks/ heavy duty equipment', 'Motorcycles', 'buses/ minibus', 'vehicle spare part', 'Boats', 'RVs and Camper', 'Scooter', 'Others']
            ],
            [
                'name' => 'Jobs',
                'subcategories' => ['Full-time Jobs', 'Part-time Jobs', 'Internships', 'Freelance Work', 'Others']
            ],
            [
                'name' => 'Pets',
                'subcategories' => ['Dogs', 'Cats', 'Other Pets', 'Pet Supplies', 'Others']
            ],
            [
                'name' => 'Services',
                'subcategories' => ['Beauty and Wellness', 'Pet Services', 'Home Services', 'Tutoring and Lessons', 'Others']
            ],
        ];

        foreach ($categories as $categoryData) {
            $parent = Category::create(['name' => $categoryData['name']]);
            foreach ($categoryData['subcategories'] as $subcategoryName) {
                Category::create([
                    'name' => $subcategoryName,
                    'parent_id' => $parent->id
                ]);
            }
        }
    }
}
