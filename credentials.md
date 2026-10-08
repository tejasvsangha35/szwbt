# South Zone Women's Badminton Championship 2026 (SZWBT)
## Official System Credentials & Authentication Directory

> **CONFIDENTIAL**: For authorized championship personnel and administration only. All access is protected by Role-Based Access Control (RBAC) and monitored via tamper-evident audit logging.

---

### Universal Default Password
The default security passcode for all pre-seeded official accounts is:
```text
szwbt2026pass
```

---

### Central Authentication Endpoint
- **Unified Login Terminal**: [`http://localhost:3000/login`](http://localhost:3000/login)
- **Automatic Smart Routing**: The login gateway automatically authenticates the credential, checks assigned RBAC roles, resolves the primary destination, and securely dispatches the user to their designated operational portal.

---

### Comprehensive Account Directory

#### 1. Executive & Root Operations
| Role | Email / Login ID | Password | Clearance Level | Primary Portal Route | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin / Root** | `admin@szwbt2026.edu` | `szwbt2026pass` | Level 04 Root | [`/admin`](http://localhost:3000/admin)<br>[`/admin/system/users`](http://localhost:3000/admin/system/users) | Complete administrative authority over system health, users, credentials, roles, audit trails, and platform settings. |

#### 2. Technical Operations (TechOps) & Match Command
| Role | Email / Login ID | Password | Clearance Level | Primary Portal Route | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Technical Operations Lead (TechOps)** | `techops@szwbt2026.edu` | `szwbt2026pass` | TechOps Command | [`/operations`](http://localhost:3000/operations)<br>[`/operations/matches`](http://localhost:3000/operations/matches) | Technical match command, court assignation, umpire conflict management, live interventions (court release, delay, walkovers), and queue flow. |
| **Arena Operations Controller** | `ops@szwbt2026.edu` | `szwbt2026pass` | Field Command | [`/operations`](http://localhost:3000/operations) | Court equipment readiness, venue physical telemetry, shuttlecock supply, arena coordination, and incident dispatch. |
| **Lead Controller (Multi-Role)** | `lead.multirole@szwbt2026.edu` | `szwbt2026pass` | Controller / Dual | [`/admin`](http://localhost:3000/admin)<br>[`/admin/live`](http://localhost:3000/admin/live) | Tournament Admin & Finance Staff dual-clearance for court schedules, live telemetry, and prize allocations. |
| **Tournament Secretariat** | `organizer@szwbt2026.edu` | `szwbt2026pass` | SZWBT Secretariat | [`/organizer`](http://localhost:3000/organizer) | Executive notices, university official delegations, credential issuance, and ceremony schedules. |
| **Reports & Analytics Lead** | `reports@szwbt2026.edu` | `szwbt2026pass` | Analytics Command | [`/admin/reports`](http://localhost:3000/admin/reports) | Real-time tournament KPIs, participation reports, CSV data exports, and audit reports. |
| **Communications Controller** | `comm@szwbt2026.edu` | `szwbt2026pass` | Broadcast HUD | [`/admin/communications`](http://localhost:3000/admin/communications) | Broadcast announcements, SMS/email dispatches, emergency alerts, and press bulletins. |

#### 3. Document Scanning & Verification Desk
| Role | Email / Login ID | Password | Clearance Level | Primary Portal Route | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Document Scanner Officer** | `scanner@szwbt2026.edu` | `szwbt2026pass` | Doc Scanner 01 | [`/scanner`](http://localhost:3000/scanner) | Mobile-first document scanner: QR scan of participant badges, phone camera capture of University ID, SSLC (10th) & PUC (12th) marks cards. |
| **Document Verification Lead** | `documents@szwbt2026.edu` | `szwbt2026pass` | Doc Verification | [`/scanner`](http://localhost:3000/scanner)<br>[`/admin/registrations`](http://localhost:3000/admin/registrations) | Verification queue inspection, athlete age/enrollment eligibility validation, OCR verification, and compliance approval. |

#### 4. Registration Desk & Finance Operations
| Role | Email / Login ID | Password | Clearance Level | Primary Portal Route | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Registration Desk Chief** | `registration@szwbt2026.edu` | `szwbt2026pass` | Desk 02 Chief | [`/register`](http://localhost:3000/register) | Full 5-member team contingent intake, athlete photo capture, contingent bed allocation, fee receipting, and 5-pass generation. |
| **Dual Desk Staff (Multi-Role)** | `priya.multirole@szwbt2026.edu` | `szwbt2026pass` | Dual Desk Ops | [`/register`](http://localhost:3000/register)<br>[`/admin/accommodation`](http://localhost:3000/admin/accommodation) | Registration & Accommodation dual-clearance for seamless check-in and hostel assignment. |
| **Treasury Auditor** | `finance@szwbt2026.edu` | `szwbt2026pass` | Treasury Clearance | [`/admin/finance`](http://localhost:3000/admin/finance) | Institutional affiliation fees, security deposits, refund processing, UTR reconciliation, and financial audit reports. |

#### 5. Ground Logistics & Contingent Coordination
| Role | Email / Login ID | Password | Clearance Level | Primary Portal Route | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fleet Transport Manager** | `transport@szwbt2026.edu` | `szwbt2026pass` | Fleet Control | [`/admin/transport`](http://localhost:3000/admin/transport) | Shuttle fleet, driver assignments, Hubballi Junction/Airport pickups. *(Strict Zero Payment Policy enforced)* |
| **Hostel Logistics Officer** | `hostel@szwbt2026.edu` | `szwbt2026pass` | Residence Advisor | [`/admin/accommodation`](http://localhost:3000/admin/accommodation) | Shalmala & Vindhya Hostel block allocation, room and bed assignments, check-in/out timestamps. |
| **SPOC Desk Lead (Test)** | `spoc@szwbt2026.edu` | `szwbt2026pass` | SPOC Desk | [`/spoc`](http://localhost:3000/spoc) | SPOC test account for general coordinator workflow testing. |

##### 5.1 Official Championship SPOC Directory (26 SPOCs • 102 Assigned Teams)
All SPOC accounts authenticate via [`/login`](http://localhost:3000/login) with the default tournament password `szwbt2026pass` and are dispatched directly to [`/spoc`](http://localhost:3000/spoc) with strict team-level data isolation.

| State / Group | SPOC Name | Email / Login ID | Password | SPOC Contact | Assigned Teams |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AP** | Utkarsh Gupta | `utkarshguptaspoc@szwbt2026.edu` | `szwbt2026pass` | 7760618549 | **AP-01** (Acharya Nagarjuna), **AP-02** (Adikavi Nannaya), **AP-03** (Andhra Univ), **AP-04** (Dr. NTR Health Sciences) |
| **AP** | Ashrita Angadi | `ashritaangadispoc@szwbt2026.edu` | `szwbt2026pass` | 6366955515 | **AP-05** (GITAM), **AP-06** (JNTU Ananthpura), **AP-07** (JNTU Gurujada), **AP-08** (JNTU Kakinada) |
| **AP** | Nitisha M N | `nitishamnspoc@szwbt2026.edu` | `szwbt2026pass` | 7892923187 | **AP-09** (KLEF), **AP-10** (Krishna Univ), **AP-11** (Mohan Babu), **AP-12** (Rayalaseema) |
| **AP** | Khushi | `khushispoc@szwbt2026.edu` | `szwbt2026pass` | 9449197058 | **AP-13** (Siddharth Academy), **AP-14** (Sri Krishnadevaraya), **AP-15** (Sri Venkateshwar), **AP-16** (The Apollo Univ) |
| **AP** | Pooja P | `poojapspoc@szwbt2026.edu` | `szwbt2026pass` | 8660932088 | **AP-17** (Vighnan's), **AP-18** (Vikram Simhapuri), **AP-19** (VIT-AP), **AP-20** (Yogi Veman) |
| **KA** | Arpita Patil | `arpitapatilspoc@szwbt2026.edu` | `szwbt2026pass` | 7019416947 | **KA-01** (Valmiki), **KA-02** (Bagalkot), **KA-03** (Bangalore Univ), **KA-04** (Bengaluru North), **KA-05** (Central Univ Karnataka) |
| **KA** | Bhumika M | `bhumikamspoc@szwbt2026.edu` | `szwbt2026pass` | 6360433574 | **KA-06** (Chamarajnagara), **KA-07** (Chanakya), **KA-08** (Christ Univ), **KA-09** (Davangere) |
| **KA** | Anika B | `anikabspoc@szwbt2026.edu` | `szwbt2026pass` | 9972826672 | **KA-10** (Dr. Manmohan Singh BCU), **KA-11** (Gulbarga), **KA-12** (Hassan), **KA-13** (Haveri) |
| **KA** | Sadaf H | `sadafhspoc@szwbt2026.edu` | `szwbt2026pass` | 8867672307 | **KA-14** (Jain Univ), **KA-15** (JSS AHER), **KA-16** (Karnatak Univ), **KA-17** (Karnataka State Law) |
| **KA** | Ananya H | `ananyahspoc@szwbt2026.edu` | `szwbt2026pass` | 9591487531 | **KA-18** (Akkamahadevi), **KA-19** (Kitturu Rani), **KA-20** (KLE Academy), **KA-21** (KLE Tech) |
| **KA** | Sanjana G | `sanjanagspoc@szwbt2026.edu` | `szwbt2026pass` | 9741351090 | **KA-22** (Kristu Jayanti), **KA-23** (Kuvempu), **KA-24** (Maharani Cluster) |
| **KA** | Sakshi (NCC) | `sakshinccspoc@szwbt2026.edu` | `szwbt2026pass` | 7795444086 | **KA-25** (Mangalore Univ), **KA-26** (Manipal Academy), **KA-27** (Nitte Univ), **KA-28** (PES Univ) |
| **KA** | Vaishnavi S | `vaishnavisspoc@szwbt2026.edu` | `szwbt2026pass` | 9113999604 | **KA-29** (Presidency), **KA-30** (RGUHS), **KA-31** (Reva), **KA-32** (RV Univ), **KA-33** (SDM Univ Dharwad) |
| **KA** | Roopa H | `roopahspoc@szwbt2026.edu` | `szwbt2026pass` | 6361934927 | **KA-34** (Tumkur), **KA-35** (UAS Dharwad), **KA-36** (Univ of Mysore), **KA-37** (VSKU Ballari), **KA-38** (VTU Belagavi) |
| **KR** | Karuna | `karunaspoc@szwbt2026.edu` | `szwbt2026pass` | 8217019421 | **KR-01** (APJ Abdul Kalam), **KR-02** (Chinmay Vishwa), **KR-03** (CUSAT), **KR-04** (Kannur Univ) |
| **KR** | Soni | `sonispoc@szwbt2026.edu` | `szwbt2026pass` | 9036862732 | **KR-05** (Kerala Agricultural), **KR-06** (KUHS Thrissur), **KR-07** (MG Univ Kottayam), **KR-08** (SSUS Kalady) |
| **KR** | Shanavas | `shanavasspoc@szwbt2026.edu` | `szwbt2026pass` | 9945670955 | **KR-09** (Univ of Calicut), **KR-10** (Univ of Kerala) |
| **TN** | Purvi V Patil | `purvivpatilspoc@szwbt2026.edu` | `szwbt2026pass` | 8762104763 | **TN-01** (Alagappa), **TN-02** (Amrita Vishwavidyapeetham), **TN-03** (Anna Univ), **TN-04** (Annamalai) |
| **TN** | Sujala | `sujalaspoc@szwbt2026.edu` | `szwbt2026pass` | 9353407394 | **TN-05** (B S Abdur Rehman), **TN-06** (Bharathiar), **TN-07** (Bharathidasan), **TN-08** (Central Univ Tamilnadu) |
| **TN** | Sufala | `sufalaspoc@szwbt2026.edu` | `szwbt2026pass` | 7619267497 | **TN-09** (Dr. MGR), **TN-10** (Dravidian), **TN-11** (Hindustan Institute), **TN-12** (IIT Madras) |
| **TN** | Anvita K | `anvitakspoc@szwbt2026.edu` | `szwbt2026pass` | 6361184289 | **TN-13** (Madurai Kamaraj), **TN-14** (MS Univ Tirunelveli), **TN-15** (Mother Teresa), **TN-16** (Periyar) |
| **TN** | Vandita L | `vanditalspoc@szwbt2026.edu` | `szwbt2026pass` | 8073194891 | **TN-17** (SASTRA), **TN-18** (Saveetha), **TN-19** (SRM IST) |
| **TN** | Srinidhi (NCC) | `srinidhinccspoc@szwbt2026.edu` | `szwbt2026pass` | 9008739904 | **TN-20** (St. Joseph), **TN-21** (TNPESU), **TN-22** (Ambedkar Law), **TN-23** (Thiruvalluvar), **TN-24** (Univ of Madras) |
| **TN / PO** | **Nithish J** | `nithishjspoc@szwbt2026.edu` | `szwbt2026pass` | 8310128592 | **TN-25** (VIT Katapadi), **TN-26** (Vinayak Mission), **PO-01** (Pondicherry University) *(Exactly 3 Teams)* |
| **TE** | Goutham R | `gouthamrspoc@szwbt2026.edu` | `szwbt2026pass` | 7019688638 | **TE-01** (JNTU Hyderabad), **TE-02** (Kakatiya Univ), **TE-03** (Malla Reddy), **TE-04** (Osmania Univ) |
| **TE** | Bhakti T | `bhaktitspoc@szwbt2026.edu` | `szwbt2026pass` | 7338203033 | **TE-05** (Telangana Univ), **TE-06** (Univ of Hyderabad), **TE-07** (Woxen Univ) |

#### 6. Court Technical & Match Officiating (Dedicated Court Umpires)
| Role | Email / Login ID | Password | Clearance Level | Court Jurisdiction | Primary Portal Route | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Court 01 Umpire** | `umpire1@szwbt2026.edu`<br>`umpire1` | `szwbt2026pass` | COURT 01 UMPIRE | **Court 01** | [`/official`](http://localhost:3000/official) | Exclusive digital scoreboard, point scoring, line calls, service faults, cards, and scoresheets for Court 01 matches. |
| **Court 02 Umpire** | `umpire2@szwbt2026.edu`<br>`umpire2` | `szwbt2026pass` | COURT 02 UMPIRE | **Court 02** | [`/official`](http://localhost:3000/official) | Exclusive digital scoreboard, point scoring, line calls, service faults, cards, and scoresheets for Court 02 matches. |
| **Court 03 Umpire** | `umpire3@szwbt2026.edu`<br>`umpire3` | `szwbt2026pass` | COURT 03 UMPIRE | **Court 03** | [`/official`](http://localhost:3000/official) | Exclusive digital scoreboard, point scoring, line calls, service faults, cards, and scoresheets for Court 03 matches. |
| **Court 04 Umpire** | `umpire4@szwbt2026.edu`<br>`umpire4` | `szwbt2026pass` | COURT 04 UMPIRE | **Court 04** | [`/official`](http://localhost:3000/official) | Exclusive digital scoreboard, point scoring, line calls, service faults, cards, and scoresheets for Court 04 matches. |


#### 7. Contingents, Team Management & Athletes
| Role | Email / Login ID | Password | Clearance Level | Primary Portal Route | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **University Team Manager** | `team@szwbt2026.edu`<br>`manager.blr@szwbt2026.edu` | `szwbt2026pass` | University Desk | [`/team`](http://localhost:3000/team) | Contingent roster validation, player nomination for ties, hostel & shuttle inspection, university pass downloads. |
| **Accredited Athlete / Player** | `player@szwbt2026.edu`<br>`ananya@szwbt2026.edu` | `szwbt2026pass` | Player HUD | [`/dashboard`](http://localhost:3000/dashboard) | Digital accreditation badge, next match countdown, court call notifications, room & bus pass, self-service profile. |

#### 8. Help Desk & Support
| Role | Email / Login ID | Password | Clearance Level | Primary Portal Route | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Support Desk Lead** | `support@szwbt2026.edu` | `szwbt2026pass` | Support Command | [`/support`](http://localhost:3000/support) | Ticket intake, resolution assignments, department escalations, public responses, and confidential internal notes. |
| **Help Desk Specialist** | `agent.kavya@szwbt2026.edu` | `szwbt2026pass` | Support Desk | [`/support`](http://localhost:3000/support) | Rapid athlete inquiries, dietary requests, lost & found, accommodation queries. |

---

### Self-Service Account Management
- **Universal Profile Route**: [`http://localhost:3000/profile`](http://localhost:3000/profile)
  - Accessible to all authenticated accounts.
  - Allows editing personal phone, state, and emergency contact details.
  - Session management (active devices inspection, remote session revocation).
  - Password updating (verifies current password, enforces minimum length).
  - Notification preference controls (system-critical notifications cannot be disabled).

---

### Super Admin User & Credential Management
- **Control Interface**: [`http://localhost:3000/admin/system/users`](http://localhost:3000/admin/system/users)
  - Accessible exclusively to `SUPER_ADMIN`.
  - Account provisioning (5-step wizard with automatic credential assignment).
  - Immediate account lock / deactivation and account reactivation.
  - Role assignment & revocation (with protective safety guard preventing de-admining the sole Super Admin).
  - Administrative credential reset (generates temporary passcodes).
  - Force logout across all devices (`sessionVersion` invalidation).
  - Detailed security inspection: computed access matrix, safe session telemetry, and immutable audit logs.

---

### Security & Privacy Policies
1. **Zero Transport Payment Policy**:
   - University shuttle transit between Hubballi Junction / Airport and KLE Tech campus is **100% complimentary**.
   - No payment triggers, fees, or gateway links exist anywhere in the transport or support subsystems.
2. **Credential Privacy**:
   - Plaintext passwords and cryptographic hashes are **strictly prohibited** from ever being returned in public or administrative API payloads.
3. **Session Token Isolation**:
   - Session identifiers are never exposed over administrative API responses; only safe metadata (device type, browser, IP prefix, active timestamp) is presented.
