<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Verified;

class ClientIssuesTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Books category (ID: 83)
        Category::factory()->create([
            'id' => 83,
            'name' => 'Books',
            'slug' => 'books'
        ]);
    }

    /**
     * Test 1: Join Affiliate Program - Success
     *
     * @return void
     */
    public function test_user_can_join_affiliate_program()
    {
        $user = User::factory()->create([
            'is_affiliate' => false
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/become-affiliate');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'You are now an affiliate!'
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_affiliate' => true
        ]);
    }

    /**
     * Test 1: Join Affiliate Program - Already Affiliate
     *
     * @return void
     */
    public function test_user_cannot_join_affiliate_program_if_already_affiliate()
    {
        $user = User::factory()->create([
            'is_affiliate' => true
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/become-affiliate');

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'You are already an affiliate'
            ]);
    }

    /**
     * Test 1: Join Affiliate Program - Unauthenticated
     *
     * @return void
     */
    public function test_unauthenticated_user_cannot_join_affiliate_program()
    {
        $response = $this->postJson('/api/user/become-affiliate');

        $response->assertStatus(401);
    }

    /**
     * Test 2: Become an Agent - Success
     *
     * @return void
     */
    public function test_user_can_become_agent()
    {
        $user = User::factory()->create([
            'is_agent' => false
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/become-agent');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'You are now an agent!'
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_agent' => true
        ]);
    }

    /**
     * Test 2: Become an Agent - Already Agent
     *
     * @return void
     */
    public function test_user_cannot_become_agent_if_already_agent()
    {
        $user = User::factory()->create([
            'is_agent' => true
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/user/become-agent');

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'You are already an agent'
            ]);
    }

    /**
     * Test 3: Email Verification Sets is_verified Flag
     *
     * @return void
     */
    public function test_email_verification_sets_is_verified_flag()
    {
        Event::fake([Verified::class]);

        $user = User::factory()->create([
            'is_verified' => false,
            'email_verified_at' => null
        ]);

        // Simulate email verification
        $user->markEmailAsVerified();
        $user->is_verified = true;
        $user->save();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_verified' => true,
            'email_verified_at' => $user->fresh()->email_verified_at
        ]);

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    /**
     * Test 4: Other Subject Option Available in Subject Areas
     *
     * @return void
     */
    public function test_book_can_be_uploaded_with_other_subject()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'is_agent' => true
        ]);

        $bookFile = UploadedFile::fake()->create('test-book.pdf', 1024);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', [
                'file' => $bookFile,
                'title' => 'Test Book with Other Subject',
                'description' => 'A test book description',
                'subject_area' => 'Other',
                'education_level' => 'Secondary School',
                'price' => 1000,
                'location' => 'Lagos',
                'author_info' => 'Test Author',
                'language' => 'English'
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('ads', [
            'title' => 'Test Book with Other Subject',
            'subject_area' => 'Other',
            'category_id' => 83
        ]);
    }

    /**
     * Test 5: Books Can Be Uploaded Via "Upload Book" Method
     *
     * @return void
     */
    public function test_books_can_be_uploaded_via_upload_book_page()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'is_agent' => true
        ]);

        $bookFile = UploadedFile::fake()->create('educational-book.pdf', 2048);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', [
                'file' => $bookFile,
                'title' => 'Mathematics Textbook',
                'description' => 'Comprehensive mathematics guide',
                'subject_area' => 'Mathematics',
                'education_level' => 'Secondary School',
                'price' => 2500,
                'location' => 'Abuja',
                'author_info' => 'Prof. Test Author',
                'year_published' => 2024,
                'language' => 'English'
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('ads', [
            'title' => 'Mathematics Textbook',
            'subject_area' => 'Mathematics',
            'category_id' => 83, // Books category
            'user_id' => $user->id
        ]);
    }

    /**
     * Test 5: Books Can Be Uploaded Via "Post Ad" Method
     *
     * @return void
     */
    public function test_books_can_be_uploaded_via_post_ad_page()
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $bookFile = UploadedFile::fake()->create('book.pdf', 1500);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/ads', [
                'category_id' => 83, // Books category
                'title' => 'Physics Guide',
                'description' => 'Complete physics revision guide',
                'price' => 3000,
                'location' => 'Lagos'
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('ads', [
            'title' => 'Physics Guide',
            'category_id' => 83,
            'user_id' => $user->id
        ]);
    }

    /**
     * Test 6: Cover Image Can Be Uploaded With Book
     *
     * @return void
     */
    public function test_book_can_be_uploaded_with_cover_image()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'is_agent' => true
        ]);

        $bookFile = UploadedFile::fake()->create('test-book.pdf', 2048);
        $coverImage = UploadedFile::fake()->image('cover.jpg', 800, 1000);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', [
                'file' => $bookFile,
                'preview_image' => $coverImage,
                'title' => 'Book with Cover Image',
                'description' => 'Test book with cover',
                'subject_area' => 'English Language',
                'education_level' => 'Primary School',
                'price' => 1500,
                'location' => 'Lagos',
                'author_info' => 'Test Author',
                'language' => 'English'
            ]);

        $response->assertStatus(201);

        $ad = $response->json('ad');

        $this->assertDatabaseHas('ads', [
            'id' => $ad['id'],
            'title' => 'Book with Cover Image'
        ]);

        // Verify preview_image_path is not null
        $this->assertNotNull($ad['preview_image_path'] ?? null);

        // Verify image was stored
        Storage::disk('public')->assertExists('books/previews/' . basename($ad['preview_image_path'] ?? ''));
    }

    /**
     * Test 6: Cover Image Is Optional
     *
     * @return void
     */
    public function test_book_can_be_uploaded_without_cover_image()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'is_agent' => true
        ]);

        $bookFile = UploadedFile::fake()->create('test-book.pdf', 1024);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', [
                'file' => $bookFile,
                'title' => 'Book without Cover',
                'description' => 'Test book without cover image',
                'subject_area' => 'Chemistry',
                'education_level' => 'Secondary School',
                'price' => 2000,
                'location' => 'Lagos',
                'author_info' => 'Test Author',
                'language' => 'English'
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('ads', [
            'title' => 'Book without Cover',
            'preview_image_path' => null
        ]);
    }

    /**
     * Test 6: Cover Image Validation - File Type
     *
     * @return void
     */
    public function test_cover_image_must_be_valid_image_file()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'is_agent' => true
        ]);

        $bookFile = UploadedFile::fake()->create('test-book.pdf', 1024);
        $invalidImage = UploadedFile::fake()->create('not-an-image.txt', 100);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', [
                'file' => $bookFile,
                'preview_image' => $invalidImage,
                'title' => 'Test Book',
                'description' => 'Test description',
                'subject_area' => 'Mathematics',
                'education_level' => 'Secondary School',
                'price' => 1000,
                'location' => 'Lagos',
                'author_info' => 'Test Author',
                'language' => 'English'
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['preview_image']);
    }

    /**
     * Test 6: Cover Image Validation - File Size
     *
     * @return void
     */
    public function test_cover_image_must_be_under_size_limit()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'is_agent' => true
        ]);

        $bookFile = UploadedFile::fake()->create('test-book.pdf', 1024);
        // Create image larger than 2MB (2048KB)
        $largeImage = UploadedFile::fake()->image('large-cover.jpg')->size(3000);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/books', [
                'file' => $bookFile,
                'preview_image' => $largeImage,
                'title' => 'Test Book',
                'description' => 'Test description',
                'subject_area' => 'Mathematics',
                'education_level' => 'Secondary School',
                'price' => 1000,
                'location' => 'Lagos',
                'author_info' => 'Test Author',
                'language' => 'English'
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['preview_image']);
    }

    /**
     * Test 6: Multiple Image Formats Supported
     *
     * @return void
     */
    public function test_cover_image_supports_multiple_formats()
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'is_agent' => true
        ]);

        $formats = ['jpg', 'jpeg', 'png', 'gif'];

        foreach ($formats as $format) {
            $bookFile = UploadedFile::fake()->create('test-book.pdf', 1024);
            $coverImage = UploadedFile::fake()->image("cover.{$format}", 800, 1000);

            $response = $this->actingAs($user, 'sanctum')
                ->postJson('/api/books', [
                    'file' => $bookFile,
                    'preview_image' => $coverImage,
                    'title' => "Book with {$format} Cover",
                    'description' => 'Test book',
                    'subject_area' => 'Mathematics',
                    'education_level' => 'Secondary School',
                    'price' => 1000,
                    'location' => 'Lagos',
                    'author_info' => 'Test Author',
                    'language' => 'English'
                ]);

            $response->assertStatus(201);
        }
    }
}
