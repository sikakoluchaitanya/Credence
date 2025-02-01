import { Laptop, LucideIcon, Smartphone } from "lucide-react"
import UAParser from "ua-parser-js"
import { formatDistanceToNowStrict, isPast, format } from "date-fns"

type DeviceType = "Mobile" | "Desktop"

interface AgentType {
    deviceType: string
    browser: string
    os: string
    timeAgo : string
    icon: LucideIcon
}

export const parseUserAgent = (
    userAgent: string,
    createdAt: string
): AgentType => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const deviceType = result.device.type || "Desktop";
    const browser = result.browser.name || "web";
    const os = `${result.os.name} ${result.os.version}`;
    const icon = deviceType === "mobile" ? Smartphone : Laptop;
    const formattedAt = isPast(new Date(createdAt)) 
        ? `${formatDistanceToNowStrict(new Date(createdAt))} ago`
        : format(new Date(createdAt), "d MMM, yyyy");

    return {
        deviceType,
        browser,
        os,
        timeAgo: formattedAt,
        icon
    }
}