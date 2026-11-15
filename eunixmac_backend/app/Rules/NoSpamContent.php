<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class NoSpamContent implements Rule
{
    private const MAX_EMOJIS = 3;
    private const MAX_REPEATED_CHARS = 4;

    // \x{1F300}-\x{1FAFF}: misc symbols/pictographs, supplemental symbols, emoticons, transport, dingbats
    // \x{2600}-\x{27BF}: misc symbols, dingbats
    private const EMOJI_PATTERN = '/[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2190}-\x{21FF}\x{2B00}-\x{2BFF}]/u';

    private string $failureMessage = '';

    public function passes($attribute, $value): bool
    {
        if (!is_string($value)) {
            return true;
        }

        $emojiCount = preg_match_all(self::EMOJI_PATTERN, $value);
        if ($emojiCount > self::MAX_EMOJIS) {
            $this->failureMessage = "The :attribute contains too many emojis ({$emojiCount}). Please limit emoji use to keep listings readable.";
            return false;
        }

        if (preg_match('/(.)\1{' . self::MAX_REPEATED_CHARS . ',}/u', $value)) {
            $this->failureMessage = 'The :attribute contains excessive repeated characters (e.g. "!!!!!" or "aaaaa"), which looks like spam.';
            return false;
        }

        return true;
    }

    public function message(): string
    {
        return $this->failureMessage ?: 'The :attribute looks like spam content.';
    }
}
