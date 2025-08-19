import React from 'react';
import { FacebookLoginButton, GoogleLoginButton, TwitterLoginButton } from 'react-social-login-buttons';
import { API_CONFIG } from '../config/api';

const SocialLogin = () => {
    const handleSocialLogin = (provider) => {
        window.location.href = `${API_CONFIG.BASE_URL}/auth/${provider}/redirect`;
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
