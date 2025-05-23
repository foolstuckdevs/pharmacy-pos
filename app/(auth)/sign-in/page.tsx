'use client';

import AuthForm from '@/components/AuthForm';
import { signInWithCredentials } from '@/lib/actions/auth';
import { signInSchema } from '@/lib/validation';
import React from 'react';

const Page = () => {
  return (
    <>
      <AuthForm
        type="SIGN_IN"
        schema={signInSchema}
        defaultValues={{ email: '', password: '' }}
        onSubmit={async (data) => {
          const result = await signInWithCredentials(data);
          return result;
        }}
      />
    </>
  );
};

export default Page;
