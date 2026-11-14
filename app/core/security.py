from urllib.parse import urlparse
import ipaddress
import socket

# Blocked loopback and private hostname identifiers
BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "0.0.0.0", "::1"}

def is_safe_url(url: str) -> bool:
    """
    Validates the given URL to guard against SSRF (Server-Side Request Forgery).
    Rejects private IPs, loopback hosts, link-local addresses, and unsupported protocols.
    """
    if not url or not isinstance(url, str):
        return False

    try:
        parsed = urlparse(url.strip())
        if parsed.scheme not in ("http", "https"):
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        hostname_lower = hostname.lower()
        if hostname_lower in BLOCKED_HOSTNAMES:
            return False

        # 1. Test directly if hostname is an IP string
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                return False
        except ValueError:
            # 2. Hostname is a domain name; resolve IP securely
            try:
                resolved_ip = socket.gethostbyname(hostname)
                ip = ipaddress.ip_address(resolved_ip)
                if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                    return False
            except Exception:
                pass

        return True
    except Exception:
        return False
