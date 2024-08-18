import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
    callbacks: {
        authorized({ auth, request: { nextUrl }}) {
            const isLoggedIn = ! !auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if(isOnDashboard){
                if(isLoggedIn){
                    return false; //redirect unauthenticated users to the login page
                }
            } else if(isLoggedIn){
                return Response.redirect(new URL('/dashboard',nextUrl));
            }
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;



