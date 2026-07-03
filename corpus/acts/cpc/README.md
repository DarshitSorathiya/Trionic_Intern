# Code of Civil Procedure (CPC), 1908

The **Code of Civil Procedure, 1908 (CPC)** is a procedural law in India that regulates the procedure of civil courts. It provides the legal machinery for the enforcement of civil rights and the adjudication of civil disputes.

---

## ⚠️ CRITICAL NOTICE: CPC vs. CrPC Distinction

Future contributors and developers working on this repository **MUST NOT** confuse **CPC** with **CrPC**. They are entirely separate acts serving different legal domains.

| Feature | Code of Civil Procedure (CPC) | Code of Criminal Procedure (CrPC) |
|---|---|---|
| **Year of Enactment** | 1908 | 1973 |
| **Legal Domain** | **Civil Law** (Property disputes, contract breaches, family matters, consumer disputes, etc.) | **Criminal Law** (Theft, murder, fraud, public peace, bail, arrest procedures, etc.) |
| **Operative Structure** | Divided into substantive **Sections** (1 to 158) and procedural **Orders** (I to LI) with Rules under the First Schedule. | Divided into **Chapters** (I to XXXVII) and **Sections** (1 to 484). |
| **Downstream Routings** | Drives workflows such as **legal-notice** and **consumer-complaint** drafting. | Drives criminal investigations, bails, FIR filings, and trial procedures. |
| **Act Code** | `CPC-1908` | `CRPC-1973` |

### Why Future Contributors Should Not Confuse Them
- **Workflow Routing Errors**: Downstream drafting models distinguish civil claims (which require CPC procedural notice before suing the government under Section 80, or Plaints under Order VII) from criminal filings. Using `CRPC` when `CPC` is required (or vice versa) will break citation verification and draft rendering.
- **Node-ID Collision**: CPC uses `CPC-1908/ORD-<ROMAN>/R-<NUMBER>` for First Schedule Rules, whereas CrPC uses `CRPC-1973/CH-<ROMAN>/S-<NUMBER>`. Confusing the schemas will cause database constraint violations.
