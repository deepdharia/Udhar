# New Glaral site domain

The Glaral site serves the Udhar app at /udhar and its project overview at /projects/udhar. DNS connects the entire glaral.com hostname; it does not configure individual paths. The site remains owner-private until its audience is changed separately.

Add these DNS records at the existing authoritative DNS provider:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 162.159.143.30 |
| A | @ | 172.66.3.26 |
| TXT | _openai-site-verification | openai-site-verification=KSSpcg8DLJf3XSoBL3rqeIuw_B-ztedBrNZP1nD_g7Y |
| TXT | _cf-custom-hostname | 40c36b83-af21-4450-806a-c9b3e7552837 |

Replace conflicting apex web-hosting A/AAAA/ALIAS/CNAME records when switching the whole Glaral website. Preserve mail MX and unrelated TXT records. Use DNS-only mode if the provider offers proxying. Recheck SSL and validation after propagation. No DNS record can be set for /udhar.
