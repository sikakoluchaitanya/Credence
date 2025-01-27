"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    const [mounted, setMounted] = React.useState(false);

    // Ensure the component is only rendered on the client side
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything until the component has mounted
    if (!mounted) {
        return null;
    }

    return (
        <NextThemesProvider {...props}>
            {children}
        </NextThemesProvider>
    );
}