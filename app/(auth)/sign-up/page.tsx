'use client';

import AuthForm from '@/components/AuthForm';
import { signUp } from '@/lib/actions/auth';
import { signUpSchema } from '@/lib/validation';
import React from 'react';

const Page = () => {
  return (
    <>
      <AuthForm
        type="SIGN_UP"
        schema={signUpSchema}
        defaultValues={{ fullName: '', email: '', password: '' }}
        onSubmit={signUp}
      />
    </>
  );
};

export default Page;
