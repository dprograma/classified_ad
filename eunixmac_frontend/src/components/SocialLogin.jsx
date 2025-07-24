import React from 'react';
import { FacebookLoginButton, GoogleLoginButton, TwitterLoginButton } from 'react-social-login-buttons';

const SocialLogin = () => {
    const handleSocialLogin = (provider) => {
        window.location.href = `http://localhost:8000/api/auth/${provider}/redirect`;
    };

    return (
        <div>
            <FacebookLoginButton onClick={() => handleSocialLogin('facebook')} />
            <GoogleLoginButton onClick={() => handleSocialLogin('google')} />
            {/* <TwitterLoginButton onClick={() => handleSocialLogin('twitter')} /> */}
        </div>
    );
};

export default SocialLogin;
