import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // req.nextauth.token exists and was validated by the callback
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/admin") && path !== "/admin/login") {
          return token?.role === "ADMIN";
        }
        return true;
      },
    },
    pages: { signIn: "/admin/login" },
  }
);

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
