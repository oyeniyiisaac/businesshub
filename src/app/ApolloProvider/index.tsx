"use client";
import React from 'react'
import { ApolloProvider as Provider } from "@apollo/client/react";
import client from '@/src/graphql/apollo-client';

export const ApolloProvider = ({children}: {children: React.ReactNode}) => {
  return (
    <Provider client={client}>
        {children}
    </Provider>
  )
}
