<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            // Electronics
            [
                'name' => 'Electronics',
                'icon' => 'electronics',
                'children' => [
                    'Smartphones',
                    'Laptops', 
                    'Tablets',
                    'Smartwatches',
                    'Gaming Consoles'
                ]
            ],
            // Fashion
            [
                'name' => 'Fashion',
                'icon' => 'fashion',
                'children' => [
                    "Men's Clothing",
                    "Women's Clothing", 
                    "Kids' Clothing",
                    'Footwear',
                    'Accessories'
                ]
            ],
            // Vehicles
            [
                'name' => 'Vehicles',
                'icon' => 'vehicles',
                'children' => [
                    'Cars',
                    'Trucks',
                    'Motorcycles',
                    'Buses',
                    'Spare Parts',
                    'Boats',
                    'RVs',
                    'Scooters'
                ]
            ],
            // Real Estate
            [
                'name' => 'Real Estate',
                'icon' => 'real_estate',
                'children' => [
                    'Apartments for Rent',
                    'Houses for Sale',
                    'Commercial Properties',
                    'Land'
                ]
            ],
            // Home and Kitchen
            [
                'name' => 'Home and Kitchen',
                'icon' => 'home_kitchen',
                'children' => [
                    'Furniture',
                    'Decor',
                    'Kitchen Appliances',
                    'Bed and Bath',
                    'Outdoor Living'
                ]
            ],
            // Beauty and Personal Care
            [
                'name' => 'Beauty and Personal Care',
                'icon' => 'beauty',
                'children' => [
                    'Skincare',
                    'Haircare',
                    'Makeup',
                    'Fragrances',
                    'Wellness and Health'
                ]
            ],
            // Sports and Outdoors
            [
                'name' => 'Sports and Outdoors',
                'icon' => 'sports',
                'children' => [
                    'Fitness Equipment',
                    'Team Sports',
                    'Outdoor Gear',
                    'Camping and Hiking',
                    'Cycling'
                ]
            ],
            // Toys and Games
            [
                'name' => 'Toys and Games',
                'icon' => 'toys',
                'children' => [
                    'Action Figures',
                    'Dolls',
                    'Board Games',
                    'Puzzles',
                    'Outdoor Toys'
                ]
            ],
            // Books and Media
            [
                'name' => 'Books and Media',
                'icon' => 'books',
                'children' => [
                    'Fiction',
                    'Non-Fiction',
                    'Music',
                    'Movies',
                    'TV Shows'
                ]
            ],
            // Health and Wellness
            [
                'name' => 'Health and Wellness',
                'icon' => 'health',
                'children' => [
                    'Supplements',
                    'Fitness/Exercise',
                    'Healthy Snacks',
                    'Medical Equipment'
                ]
            ],
            // Baby and Kids
            [
                'name' => 'Baby and Kids',
                'icon' => 'baby',
                'children' => [
                    'Strollers',
                    'Car Seats',
                    'Toys',
                    'Clothing',
                    'Nursery Furniture'
                ]
            ],
            // Pet Care
            [
                'name' => 'Pet Care',
                'icon' => 'pets',
                'children' => [
                    'Food',
                    'Toys',
                    'Grooming',
                    'Health'
                ]
            ],
            // Jobs
            [
                'name' => 'Jobs',
                'icon' => 'jobs',
                'children' => [
                    'Full-time',
                    'Part-time',
                    'Internships',
                    'Freelance'
                ]
            ],
            // Services
            [
                'name' => 'Services',
                'icon' => 'services',
                'children' => [
                    'Beauty',
                    'Pet',
                    'Home',
                    'Tutoring'
                ]
            ],
            // Education Material
            [
                'name' => 'Education Material',
                'icon' => 'education',
                'children' => [
                    'Past Questions',
                    'Ebooks',
                    'Publications'
                ]
            ],
            // Building Materials
            [
                'name' => 'Building Materials',
                'icon' => 'building',
                'children' => [
                    'Cement',
                    'Blocks',
                    'Roofing Sheets',
                    'Tiles',
                    'Plumbing and Electrical Fixtures'
                ]
            ]
        ];

        foreach ($categories as $categoryData) {
            $parent = Category::create([
                'name' => $categoryData['name'],
                'icon' => $categoryData['icon'],
                'parent_id' => null
            ]);

            if (isset($categoryData['children'])) {
                foreach ($categoryData['children'] as $childName) {
                    Category::create([
                        'name' => $childName,
                        'icon' => null,
                        'parent_id' => $parent->id
                    ]);
                }
            }
        }
    }
}