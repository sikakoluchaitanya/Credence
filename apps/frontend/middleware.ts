import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ['/home', '/sessions'];
const publicRoutes = [
    '/',
    "/signup",
    "/verify-mfa",
    "/forgot-password",
    "/reset-password",
    "/confirm-account",
];

export  default async function middleware(req: NextRequest) {
    const paths = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(paths);
    const isPublicRoute = publicRoutes.includes(paths);

    const accessToken = req.cookies.get("accessToken")?.value;

    if(isProtectedRoute && !accessToken) {
        return NextResponse.redirect(new URL("/", req.nextUrl))
    }

    if(isPublicRoute && accessToken) {
        return NextResponse.redirect(new URL("/home", req.nextUrl))
    }

    return NextResponse.next();
}