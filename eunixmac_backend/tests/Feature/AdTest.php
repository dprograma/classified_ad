<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_ad_with_images(): void
    {
        Storage::fake('public');
        
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        $image1 = UploadedFile::fake()->image('ad1.jpg');
        $image2 = UploadedFile::fake()->image('ad2.jpg');

        $response = $this->actingAs($user)
            ->postJson('/api/ads', [
                'title' => 'Test Ad',
                'description' => 'This is a test ad',
                'price' => 100.00,
                'category_id' => $category->id,
                'images' => [$image1, $image2],
            ]);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'id',
                    'title',
                    'description',
                    'price',
                    'category_id',
                    'user_id',
                    'images' => [
                        '*' => [
                            'id',
                            'url'
                        ]
                    ]
                ]);

        // Assert the files were stored
        Storage::disk('public')->assertExists('ads/' . $image1->hashName());
        Storage::disk('public')->assertExists('ads/' . $image2->hashName());
    }

    public function test_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/ads', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['title', 'description', 'price', 'category_id']);
    }

    public function test_validates_image_types(): void
    {
        Storage::fake('public');
        
        $user = User::factory()->create();
        $category = Category::factory()->create();
        
        $invalidFile = UploadedFile::fake()->create('document.pdf');

        $response = $this->actingAs($user)
            ->postJson('/api/ads', [
                'title' => 'Test Ad',
                'description' => 'This is a test ad',
                'price' => 100.00,
                'category_id' => $category->id,
                'images' => [$invalidFile],
            ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['images.0']);
    }
}
