Technical Report: Configuration of MikroTik hAP ax² for Captive Portal Project
Prepared by: Jestone
Date: October 19, 2025
Device: MikroTik hAP ax² (Model: C52iG-5HaxD2HaxD-TC)
1. Executive Summary
The objective was to take a brand-new MikroTik hAP ax² router and configure it for use in a WiFi monetization project. The initial challenge was an unstable default Wi-Fi connection. This was resolved by completing the mandatory initial setup. Subsequently, the router's "Hotspot" service was configured and tested to confirm its captive portal capabilities. A minor configuration error was encountered and successfully resolved. The router is now fully prepared and verified, awaiting final integration with the live web application.
2. Phase 1: Initial Setup and Problem Resolution
Initial State: Upon first power-on, the router broadcasted a default Wi-Fi network. However, any device attempting to connect would enter a "connect-disconnect" loop, failing to obtain a stable IP address. This initially suggested a hardware fault.
Diagnosis: I determined the behavior was not a bug but a built-in security feature of MikroTik's RouterOS. The router intentionally prevents stable wireless connections until an administrator logs in and completes the initial configuration.
Resolution Process:
Direct Connection: I established a direct, stable link to the router by connecting my laptop to its LAN port (#2) via an Ethernet cable.
Web Interface Access: Using a web browser, I navigated to the router's default IP address (192.168.88.1).
Initial Configuration: I logged in with the default credentials (admin/no password) and was presented with the "Quick Set" page. I successfully configured the three mandatory settings:
Country: Set to my local region to comply with wireless regulations.
Wi-Fi Password: A new, secure password was set for the wireless network.
Router Password: A new administrator password was set to secure the router itself.
Applying Settings: After applying the configuration, the router restarted its services.

Outcome of Phase 1: The router's Wi-Fi network became fully stable and accessible using the new password. The device was now a standard, secure, internet-connected router.
3. Phase 2: Advanced Configuration for Captive Portal (Hotspot Setup)
Objective: To enable and configure the specific "Hotspot" feature required to capture and redirect users for the monetization project.
Tool Selection: For this advanced setup, I transitioned from the web interface to the WinBox desktop application for more reliable and granular control.
Configuration Process (Hotspot Setup Wizard):
I logged into the router via WinBox and navigated to IP -> Hotspot.
I initiated the "Hotspot Setup" wizard and proceeded through the following steps:
Hotspot Interface: Set to bridge to ensure the service runs on the entire local network (both wired and wireless).
Local Address & Address Pool: Accepted the default network settings (192.168.88.1/24).
Certificate & SMTP: Skipped these steps by selecting none and 0.0.0.0 respectively, as they are not needed for this project.
DNS Servers: Accepted the default DNS servers provided by the router.
Troubleshooting and Correction:
Error Encountered: During the setup wizard, on the "DNS Servers" screen, I initially entered the text wifi.login. This resulted in an error message: "Error in - ip address expected!".
Root Cause Analysis: I correctly identified that the "DNS Servers" field requires a numerical IP address, and the text I entered belonged in the next step.
Corrective Action: I clicked the "Back" button, left the "DNS Servers" field with its pre-filled default IP address, and proceeded to the next screen, "DNS Name." Here, I correctly entered wifi.login.
Finalizing the Wizard: I completed the final step by creating a local test user (admin with password 1234).
4. Phase 3: System Verification and Final Outcome
Verification Test: I performed a crucial test by connecting a fresh device (my phone) to the configured Wi-Fi network. Upon opening a web browser and attempting to navigate to a site, the router successfully intercepted the connection and redirected the browser to the internal login page at wifi.login.
Conclusion: This successful test confirms that the MikroTik hAP ax² hardware and its Hotspot functionality are working exactly as required for the project. The core mechanism of capturing and redirecting users is fully operational. The router is now in a "ready" state, awaiting the final, simple configuration changes (enabling RADIUS) that will point it to the live application once it is deployed.
