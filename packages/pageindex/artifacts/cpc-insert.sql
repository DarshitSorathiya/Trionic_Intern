-- SQL Ingestion script for CPC, 1908
-- Target DB: PostgreSQL

INSERT INTO acts (act_code, full_name, year, source_url) 
VALUES ('CPC-1908', 'Code of Civil Procedure, 1908', 1908, 'https://indiacode.nic.in') 
ON CONFLICT (act_code) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO act_snapshots (snapshot_id, act_code, version_label, pulled_at, source_url, is_current) 
VALUES ('CPC-1908_2026-06-11', 'CPC-1908', 'v1', '2026-06-11', 'https://indiacode.nic.in', true) 
ON CONFLICT (snapshot_id) DO UPDATE SET is_current = EXCLUDED.is_current;

INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908', 'CPC-1908_2026-06-11', NULL, 'act', 'Code of Civil Procedure, 1908', 'Code of Civil Procedure, 1908
An Act to consolidate and amend the laws relating to the procedure of the Courts of Civil Judicature.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-1', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 1 — Short title, commencement and extent', '1. Short title, commencement and extent
(1)This Act may be cited as the Code of Civil Procedure,1908.


(2) It shall come into force on the first day of January, 1909.


1[(3) It extends to the whole of India except-- 


2* * * * *


(b) the State of Nagaland and the tribal areas :


Provided that the State Government concerned may, by notification in the Official Gazette, extend the provisions of this Code or any of them to the whole or part of the State of Nagaland or such tribal areas, as the case may be, with such supplemental, incidental or consequential modifications as may be specified in the notification.


Explanation.-- In this clause, "tribal areas" means the territories which, immediately before the 21st day of January, 1972, were included in the tribal areas of Assam as referred to in paragraph 20 of the Sixth Schedule to the Constitution.


(4)In relation to the Amindivi Islands, and the East Godavari, West Godavari and Visakhapatnam Agencies in the State of Andhra Pradesh and the Union Territory of Lakshadweep, the application of this Code shall be without prejudice to the application of any rule or regulation for the time being in force in such Islands, Agencies or such Union Territory, as the case may be, relating to the application of this Code.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-2', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 2 — Definitions', '2. Definitions
In this Act, unless there is anything repugnant in the subject or context, 

(1) "Code" includes rules;

(2) "decree" means the formal expression of an adjudication which, so far as regards the Court
expressing it, conclusively determines the rights of the parties with regard to all or any of the matters in
controversy in the suit and may be either preliminary or final. It shall be deemed to include the rejection
of a plaint and the determination of any question within 1*** section 144, but shall not include 

(a) any adjudication from which an appeal lies as an appeal from an order, or

(b) any order of dismissal for default.

Explanation.A decree is preliminary when further proceedings have to be taken before the suit
can be completely disposed of. It is final when such adjudication completely disposes of the suit. It
may be partly preliminary and partly final;

(3) "decree-holder" means any person in whose favour a decree has been passed or an order
capable of execution has been made;

(4) "district" means the local limits of the jurisdiction of a principal Civil Court of original
jurisdiction (hereinafter called a District Court), and includes the local limits of the ordinary
original civil jurisdiction of a High Court;


[2(5) "foreign Court" means a Court situate outside India and not established or continued by the
authority of the Central Government;] 

(6) "foreign judgment" means the judgment of a foreign Court;

(7) "Government Pleader" includes any officer appointed by the State Government to perform all
or any of the functions expressly imposed by this Code on the Government Pleader and also any
pleader acting under the directions of the Government Pleader;

(7A) "High Court" in relation to the Andaman and Nicobar Islands, means the High Court in
Calcutta;

(7B) "India", except in sections 1, 29, 43, 44, 4
[44A,] 78, 79, 82, 83 and 87A, means the territory
of India excluding the State of Jammu and Kashmir;]

(8) "Judge" means the presiding officer of a Civil Court; 

(9) "judgment" means the statement given by the Judge of the grounds of a decree or order;

(10) "judgment-debtor" means any person against whom a decree has been passed or an order capable
of execution has been made;

(11) "legal representative" means a person who in law represents the estate of a deceased person, and
includes any person who intermeddles with the estate of the deceased and where a party sues or issued in
a representative character the person on whom the estate devolves on the death of the party so suing or
sued;

(12) "mesne profits" of property means those profits which the person in wrongful possession of such
property actually received or might with ordinary diligence have received therefrom, together with
interest on such profits, but shall not include profits due to improvements made by the person in wrongful
possession;

(13) "movable property" includes growing crops;

(14) "order" means the formal expression of any decision of a Civil Court which is not a decree;

(15) "pleader" means any person entitled to appear and plead for another in Court, and includes an
advocate, a vakil and an attorney of a High Court;

(16) "prescribed" means prescribed by rules;

(17) "public officer" means a person falling under any of the following descriptions, namely:

(a) every Judge;

(b) every member of 5
[an All-India Service];

(c) every commissioned or gazetted officer in the military 6
[naval or air] forces of7
[the Union]
8
*** while serving under the Government;

(d) Every officer of a court of Justice whose duty it is, as such officer, to investigate or report on
any matter of law or fact, or to make, authenticate or keep any document, or to take charge or dispose
of any property, or to execute any judicial process, or to administer any oath, or to interpret, or to
preserve order, in the Court, and every person especially authorised by a court of Justice to perform
any of such duties;

(e) every person who holds any office by virtue of which he is empowered to place or keep any
person in confinement;

(f) every officer of the Government whose duty it is, as such officer, to prevent offences, to give
information of offences, to bring offenders to justice, or to protect the public health, safety or
convenience;

(g) every officer whose duty it is, as such officer, to take, receive, keep or expend any property on
behalf of the Government, or to make any survey, assessment or contract on behalf of the
Government, or to execute any revenue process, or to investigate, or to report on, any matter affecting
the pecuniary interests of the Government, or to make, authenticate or keep any document relating to
the pecuniary interests of the Government, or to prevent the infraction of any law for the protection of
the pecuniary interests of the Government; and

(h) every officer in the service or pay of the Government, or remunerated by fees or commission
for the performance of any public duty;

(18) "rules" means rules and forms contained in the First Schedule or made under section 122 or
section 125;

(19) "share in a corporation" shall be deemed to include stock, debenture stock, debentures or bonds;
and

(20) "signed", save in the case of a judgment or decree, includes stamped.

9* * * * *') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-3', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 3 — Subordination of Courts', '3. Subordination of Courts
For the purposes of this Code, the District Court is subordinate to the High Court, and every Civil Court of a grade inferior to that of a District Court and every Court of Small Causes is subordinate to the High Court and District Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-4', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 4 — Savings', '4. Savings
(1) In the absence of any specific provision to the Contrary, nothing in this Code shall be deemed to limit or otherwise affect any special or local law now in force or any special jurisdiction or power conferred, or any special form of procedure prescribed, by or under any other law for the time being in force.

(2) In particular and without prejudice to the generality of the proposition contained in sub-section(1), nothing in this Code shall be deemed to limit or otherwise affect any remedy which a landholder or landlord may have under any law for the time being in force for the recovery of rent of agricultural land from the produce of such land.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-5', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 5 — Application of the Code to Revenue Courts', '5. Application of the Code to Revenue Courts
(1) Where any Revenue Courts are governed by the provisions of this Code in those matters of procedure upon which any special enactment applicable to them is silent, the State Government 1 *** may, by notification in the Official Gazette, declare that any portions of those provisions which are not expressly made applicable by this Code shall not apply to those Courts, or shall only apply to them with such modifications as the State Government 2 * * * may prescribe.

(2) "Revenue Court" in sub-section (1) means a Court having jurisdiction under any local law to entertain suits or other proceedings relating to the rent, revenue or profits of land used for agricultural purposes, but does not include a Civil Court having original jurisdiction under this Code to try such suits or proceedings as being suits or proceedings of a civil nature.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-6', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 6 — Pecuniary jurisdiction', '6. Pecuniary jurisdiction
Save in so far as is otherwise expressly provided, nothing herein contained shall operate to give any Court jurisdiction over suits the amount or value of the subject-matter of which exceeds the pecuniary limits (if any) of its ordinary jurisdiction.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-7', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 7 — Provincial Small Cause Courts', '7. Provincial Small Cause Courts
The following provisions shall not extend to Courts
constituted under the Provincial Small Cause Courts Act, 1887(9 of 1887) 1
[or under the Berar Small
Cause Courts Law, 1905,] or to Courts exercising the jurisdiction of a Court of Small Causes 2[under the
said Act or Law,] 3[or to Courts in 4[any part of India to which the said Act does not extend] exercising a
a corresponding jurisdiction that is to say.--


(a) so much of the body of the Code as relates to]--


(i) suits excepted from the cognizance of a Court of Small Causes;


(ii) the execution of decrees in such suits;


(iii) the execution of decrees against immovable property; and


(b) the following sections, that is to say,--


section 9,


sections 91 and 92,


sections 94 and 95 5
[so far as they authorize or relate to]--


(i) orders for the attachment of immovable property,


(ii) injunctions,



(iii) the appointment of a receiver of immovable property, or


(iv) the interlocutory orders to in clause (e) of section 94,] and sections 96 to 112 and 115.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-8', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 8 — Presidency Small Cause Courts', '8. Presidency Small Cause Courts
Save as provided in sections 24, 38 to 41, 75, clauses (a), (b)
and (c), 76,1[77, 157 and 158,] and by the Presidency Small Cause Courts Act, 1882 (15 of 1882), the
provisions in the body of this Code shall not extend to any suit or proceeding in any Court of Small
Causes established in the towns of Calcutta, Madras and Bombay :
2[Provided that-- 
 

1) the High Courts of Judicature at Fort William, Madras and Bombay, as the case may be, may
from time to time, by notification in the Official Gazette, direct3
 that any such provisions not
inconsistent with the express provisions of the Presidency Small Cause Courts Act, 1882 (15 of 1882),
and with such modifications and adaptations as may be specified in the notification, shall extend to suits
or proceedings or any class of suits or proceedings in such Court.

(2) All rules heretofore made by any of the said High Courts under section 9 of the Presidency
Small Cause Courts Act, 1882 (15 of 1882) shall be deemed to have been validly made. ]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-9', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 9 — Courts to try all civil suits unless barred', '9. Courts to try all civil suits unless barred
The Courts shall (subject to the provisions herein
contained) have jurisdiction to try all suits of a civil nature excepting suits of which their cognizance is
either expressly or impliedly barred.

1[Explanation I].--A suit in which the right to property or to an office is contested is a suit of a civil
nature, notwithstanding that such right may depend entirely on the decision of questions as to religious
rites or ceremonies.

2[Explanation II].--For the purposes of this section, it is immaterial whether or not any fees are attached
to the office referred to in Explanation I or whether or not such office is attached to a particular place.]



STATE AMENDMENTS

Maharashtra.--

Section 9A of the Code of Civil Procedure, 1908, in its application to the State of Maharashtra
(hereinafter referred to as "the principal Act"), shall be deleted.

[Vide Maharashtra Act 61 of 2018, sec. 2.]

Notwithstanding the deletion of section 9A of the principal Act,--

(1) where consideration of a preliminary issue framed under section 9A is pending on the date of
commencement of the Code of Civil Procedure (Maharashtra Amendment) Act, 2018 (hereinafter, in this
section, referred to as "the Amendment Act"), the said issue shall be deemed to be an issue framed under
Order XIV of the principal Act and shall be decided by the Court, as it deems fit, along with all other
issues, at the time of final disposal of the suit itself :

Provided that, the evidence, if any, led by any party or parties to the suit, on the preliminary issue so
framed under section 9A, shall be considered by the Court along with evidence, if any, led on other issues
in the suit, at the time of final disposal of the suit itself ;

(2) in all the cases, where a preliminary issue framed under section 9A has been decided, holding that
the Court has jurisdiction to entertain the suit, and a challenge to such decision is pending before a
revisional Court, on the date of commencement of the Amendment Act, such revisional proceedings shall
stand abated : 

Provided that, where a decree in such suit is appealed from any error, defect or irregularity in the order
upholding jurisdiction shall be treated as one of the ground of objection in the memorandum of appeal as
if it had been included in such memorandum ;

(3) in all cases, where a preliminary issue framed under section 9A has been decided, holding that the
Court has no jurisdiction to entertain the suit, and a challenge to such decision is pending before an
appellate or revisional Court, on the date of commencement of the Amendment Act, such appellate or
revisional proceedings shall continue as if the Amendment Act has not been enacted and section 9A has
not been deleted :

Provided that, in case the appellate or revisional Court, while partly allowing such appeal or revision,
remands the matter to the trial Court for reconsideration of the preliminary issue so framed under
section 9A, upon receipt of these proceedings by the trial Court, all the provisions of the principal Act
shall apply ;

(4) in all cases, where an order granting an ad-interim relief has been passed under sub-section (2) of
section 9A prior to its deletion, such order shall be deemed to be an ad-interim order made under Order
XXXIX of the principal Act and the Court shall, at the time of deciding the application in which such an
order is made, either confirm or vacate or modify such order.

[Vide Maharashtra Act 61 of 2018, sec. 3.]

Maharashtra.--

In section 3 of the Code of Civil Procedure (Maharashtra Amendment) Act, 2018, for clause (1), the
following clause shall be substituted and shall be deemed to have been substituted with effect from 27th
June 2018, being the date of commencement of the said Act, namely:--

"(1) where consideration of a preliminary issue framed under section 9A is pending on the date of
commencement of the Code of Civil Procedure (Maharashtra Amendment) Act, 2018 (hereinafter, in this
section, referred to as "the Amendment Act"), the said issue shall be decided and disposed of by the Court
under section 9A, as if the said section 9A has not been deleted;".

[Vide Maharashtra Act 72 of 2018, sec. 2, (w.e.f. 27-6-2018.)]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-10', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 10 — Stay of suit', '10. Stay of suit
No Court shall proceed with the trial of any suit in which the matter in issue is also directly and substantially in issue in a previously instituted suit between the same parties, or between parties under whom they or any of them claim litigating under the same title where such suit is pending in the same or any other Court in 1[India] have jurisdiction to grant the relief claimed, or in any Court beyond the limits of 1[India] established or continued by 2[the Central Government 3* * *.] and having like jurisdiction, or before 4[the Supreme Court].

Explanation.--The pendency of a suit in a foreign Court does not preclude the Courts in 1[India] from trying a suit founded on the same cause of action.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-11', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 11 — Res judicata', '11. Res judicata
No Court shall try any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit between the same parties, or between parties under whom they or any of them claim, litigating under the same title, in a Court competent to try such subsequent suit or the suit in which such issue has been subsequently raised, and has been heard and finally decided by such Court.

Explanation I.-- The expression former suit shall denote a suit which has been decided prior to a suit in question whether or not it was instituted prior thereto.

Explanation II.-- For the purposes of this section, the competence of a Court shall be determined irrespective of any provisions as to a right of appeal from the decision of such Court.

Explanation III.--The matter above referred to must in the former suit have been alleged by one party and either denied or admitted, expressly or impliedly, by the other.

Explanation IV.-- Any matter which might and ought to have been made ground of defence or attack in such former suit shall be deemed to have been a matter directly and substantially in issue in such suit.

Explanation V.-- Any relief claimed in the plaint, which is not expressly granted by the decree, shall for the purposes of this section, be deemed to have been refused.

Explanation VI.-- Where persons litigate bona fide in respect of a public right or of a private right claimed in common for themselves and others, all persons interested in such right shall, for the purposes of this section, be deemed to claim under the persons so litigating .

1[Explanation VII.-- The provisions of this section shall apply to a proceeding for the execution of a decree and references in this section to any suit, issue or former suit shall be construed as references, respectively, to a proceeding for the execution of the decree, question arising in such proceeding and a former proceeding for the execution of that decree.

Explanation VIII.-- An issue heard and finally decided by a Court of limited jurisdiction, competent to decide such issue, shall operate as res judicata in a subsequent suit, notwithstanding that such Court of limited jurisdiction was not competent to try such subsequent suit or the suit in which such issue has been subsequently raised.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-12', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 12 — Bar to further suit', '12. Bar to further suit
Where a plaintiff is precluded by rules from instituting a further suit in respect of any particular cause of action, he shall not be entitled to institute a suit in respect of such cause of action in any Court to which this Code applies.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-13', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 13 — When foreign judgment not conclusive', '13. When foreign judgment not conclusive
A foreign judgment shall be conclusive as to any matter thereby directly adjudicated upon between the same parties or between parties under whom they or any of them claim litigating under the same title except--

(a) where it has not been pronounced by a Court of competent jurisdiction;

(b) where it has not been given on the merits of the case;

(c) where it appears on the face of the proceedings to be founded on an incorrect view of international law or a refusal to recognise the law of 1 [India] in cases in which such law is applicable;

(d) where the proceedings in which the judgment was obtained are opposed to natural justice;

(e) where it has been obtained by fraud;

(f) where it sustains a claim founded on a breach of any law in force in 1 [India].') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-14', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 14 — Presumption as to foreign judgments', '14. Presumption as to foreign judgments
The Court shall presume upon the production of any document purporting to be a certified copy of a foreign judgment, that such judgment was pronounced by a Court of competent jurisdiction, unless the contrary appears on the record; but such presumption may be displaced by proving want of jurisdiction.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-15', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 15 — Court in which suits to be instituted', '15. Court in which suits to be instituted
Every suit shall be instituted in the Court of the lowest grade competent to try it.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-16', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 16 — Suits to be instituted where subject-matter situate', '16. Suits to be instituted where subject-matter situate
Subject to the pecuniary or other limitations prescribed by any law, suits

(a) for the recovery of immovable property with or without rent or profits,

(b) for the partition of immovable property,

(c) for foreclosure, sale or redemption in the case of a mortgage of or charge upon immovable property,

(d) or the determination of any other right to or interest in immovable property,

(e) for compensation for wrong to immovable property,

(f) for the recovery of movable property actually under distraint or attachment,

shall be instituted in the Court within the local limits of whose jurisdiction the property is situate:

Provided that a suit to obtain relief respecting, or compensation for wrong to, immovable property held by or on behalf of the defendant may, where the relief sought can be entirely obtained through his personal obedience, be instituted either in the Court within the local limits of whose jurisdiction the property is situate, or in the Court within the local limits of whose jurisdiction the defendant actually and voluntarily resides, or carries on business, or personally works for gain.

Explanation.-- In this section "property" means property situate in 1[India].') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-17', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 17 — Suits for immovable property situate within jurisdiction of different Courts', '17. Suits for immovable property situate within jurisdiction of different Courts
Where a suit is to obtain relief respecting, or compensation for wrong to, immovable property situate within the jurisdiction of different Courts. the suit may be instituted in any Court within the local limits of whose jurisdiction any portion of the property is situate :

Provided that, in respect of the value of the subject-matter of the suit, the entire claim is cognizable by such Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-18', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 18 — Place of institution of suit where local limits of jurisdiction of Courts are uncertain', '18. Place of institution of suit where local limits of jurisdiction of Courts are uncertain
(1) Where it is alleged to be uncertain within the local limits of the jurisdiction of which of two or more Courts any immovable property is situate, any one of those Courts may, if satisfied that there is ground for the alleged uncertainty, record a statement to that effect and thereupon proceed to entertain and dispose of any suit relating to that property, and its decree in the suit shall have the same effect as if the property were situate within the local limits of its jurisdiction:

Provided that the suit is one with respect to which the Court is competent as regards the nature and value of the suit to exercise jurisdiction.

(2) Where a statement has not been recorded under sub-section (1), and an objection is taken before an Appellate or Revisional Court that a decree or order in a suit relating to such property was made by a Court not having jurisdiction where the property is situate, the Appellate or Revisional Court shall not allow the objection unless in its opinion there was, at the time of the institution of the suit, no reasonable ground for uncertainty as to the court having jurisdiction with respect thereto and there has been a consequent failure of justice.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-19', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 19 — Suits for compensation for wrongs to person or movables', '19. Suits for compensation for wrongs to person or movables
Where a suit is for compensation for wrong done to the person or to movable property, if the wrong was done within the local limits of the jurisdiction of one Court and the defendant resides, or carries on business, or personally works for gain, within the local limits of the jurisdiction of another Court, the suit may be instituted at the option of the plaintiff in either of the said Courts.

Illustrations

(a) A, residing in Delhi, beats B in Calcutta. B may sue A either in Calcutta or in Delhi.

(b) A, residing in Delhi, publishes in Calcutta statements defamatory of B. B may sue A either in Calcutta or in Delhi.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-20', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 20 — Other suits to be instituted where defendants reside or cause of action arises', '20. Other suits to be instituted where defendants reside or cause of action arises
Subject to the limitations aforesaid, every suit shall be instituted in a Court within the local limits of whose jurisdiction

(a) the defendant, or each of the defendants where there are more than one, at the time of the commencement of the suit, actually and voluntarily resides, or carries on business, or personally works for gain; or

(b) any of the defendants, where there are more than one, at the time of the commencement of the suit, actually and voluntarily resides, or carries on business, or personally works for gain, provided that in such case either the leave of the Court is given, or the defendants who do not reside, or carry on business, or personally works for gain, as aforesaid, acquiesce in such institution; or

(c)The cause of action, wholly or in part, arises.

1**** *

2[Explanation].-- A corporation shall be deemed to carry on business at its sole or principal office in 3 [India] or, in respect of any cause of action arising at any place where it has also a subordinate office, at such place.

Illustrations

(a) A is a tradesman in Calcutta, B carries on business in Delhi. B, by his agent in Calcutta, buys goods of A and requests A to deliver them to the East Indian Railway Company. A delivers the goods accordingly in Calcutta. A may sue B for the price of the goods either in Calcutta, where the cause of action has arisen, or in Delhi, where B carries on busines.

(b) A resides at Simla, B at Calcutta and C at Delhi. A, B and C being together at Benaras, B and C make a joint promissory note payable on demand, and deliver it to A. A may sue B and C at Benaras, where the cause of action arose. He may also sue them at Calcutta, where B resides, or at Delhi, where C resides; but in each of these cases, if the non-resident defendant objects, the suit cannot proceed without the leave of the Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-21', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 21 — Objections to jurisdiction', '21. Objections to jurisdiction
1[(1)] No objection as to the place of suing shall be allowed by any Appellate or Revisional Court unless such objection was taken in the Court of first instance at the earliest possible opportunity and in all cases where issues are settled at or before such settlement, and unless there has been a consequent failure of justice.

2[(2) No objection as to the competence of a Court with reference to the pecuniary limits of its jurisdiction shall be allowed by any Appellate or Revisional Court unless such objection was taken in the Court of first instance at the earliest possible opportunity, and, in all cases where issues are settled, at or before such settlement, and unless there has been a consequent failure of justice.

(3) No objection as to the competence of the executing Court with reference to the local limits of its jurisdiction shall be allowed by any Appellate or Revisional Court unless such objection was taken in the executing Court at the earliest possible opportunity, and unless there has been a consequent failure of justice.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-21A', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 21A — Baron suit to set aside decree on objection as to place of suing', '21A. Baron suit to set aside decree on objection as to place of suing
1[21A. Bar on suit to set aside decree on objection as to place of suing.-- No suit shall lie challenging the validity of a decree passed in a former suit between the same parties, or between the parties under whom they or any of them claim, litigating under the same title, on any ground based on an objection as to the place of suing.

Explanation.-- The expression former suit means a suit which has been decided prior to the decision in the suit in which the validity of the decree is questioned, whether or not the previously decided suit was instituted prior to the suit in which the validity of such decree is questioned.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-22', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 22 — Power to transfer suits which may be instituted in more than one Court', '22. Power to transfer suits which may be instituted in more than one Court
Where a suit may be instituted in any one of two or more Courts and is instituted in one of such Courts, any defendant, after notice to the other parties, may, at the earliest possible opportunity and in all cases where issues are settled at or before such settlement, apply to have the suit transferred to another Court, and the Court to which such application is made, after considering the objections of the other parties (if any), shall determine in which of the several Courts having jurisdiction the suit shall proceed.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-23', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 23 — To what Court application lies', '23. To what Court application lies
(I) Where the several Courts having jurisdiction are subordinate to the same Appellate Court, an application under section 22 shall be made to the Appellate Court.

(2) Where such Courts are subordinate to different Appellate Courts but to the same High Court, the application shall be made to the said High Court.

(3) Where such Courts are subordinate to different High Courts, the application shall be made to the High Court within the local limits of whose jurisdiction the Court in which the suit is brought is situate.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-24', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 24 — General power of transfer and withdrawal', '24. General power of transfer and withdrawal
(1) On the application of any of the parties and
after notice to the parties and after hearing such of them as desired to be heard, or of its own motion
without such notice, the High Court or the District Court may at any stage

(a) transfer any suit, appeal or other proceeding pending before it for trial or disposal to any
Court subordinate to it and competent to try or dispose of the same, or

(b) withdraw any suit, appeal or other proceeding pending in any Court subordinate to it, and

(i) try or dispose of the same; or

(ii) transfer the same for trial or disposal to any Court subordinate to it and competent to
try or dispose of the same; or

(iii) retransfer the same for trial or disposal to the Court from which it was withdrawn.

(2) Where any suit or proceeding has been transferred or withdrawn under sub-section (1), the Court
which 1[is thereafter to try or dispose of such suit or proceeding] may, subject to any special directions in the
case of an order of transfer, either retry it or proceed from the point at which it was transferred or
withdrawn.

2[(3) For the purposes of this section,

(a) Courts of Additional and Assistant Judges shall be deemed to be subordinate to the
District Court;

(b) proceeding includes a proceeding for the execution of a decree or order].

(4) The Court trying any suit transferred or withdrawn under this section from a Court of Small
Causes shall, for the purposes of such suit, be deemed to be a Court of Small Causes.

3[(5) A suit or proceeding may be transferred under this section from a Court which has no jurisdiction
to try it.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-25', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 25 — Power of Supreme Court to transfer suits, etc', '25. Power of Supreme Court to transfer suits, etc
1[25. Power of Supreme Court to transfer suits, etc.--(1) On the application of a party, and after notice to the parties, and after hearing such of them as desire to be heard, the Supreme Court may, at any stage, if satisfied that an order under this section is expedient for the ends of justice, direct that any suit, appeal or other proceeding be transferred from a High Court or other Civil Court in one State to a High Court or other Civil Court in another State.

(2) Every application under this section shall be made by a motion which shall be supported by an affidavit.

(3) The Court to which such suit, appeal or other proceeding is transferred shall, subject to any special directions in the order of transfer, either retry it or proceed from the stage at which it was transferred to it.

(4) In dismissing any application under this section, the Supreme Court may, if it is of opinion that the application was frivolous or vexatious, order the applicant to pay by way of compensation to any person who has opposed the application such sum, not exceeding two thousand rupees, as it considers appropriate in the circumstances of the case.

(5) The law applicable to any suit, appeal or other proceeding transferred under this section shall be the law which the Court in which the suit, appeal or other proceeding was originally instituted ought to have applied to such suit, appeal or proceeding.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-26', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 26 — Institution of suits', '26. Institution of suits
1[(1)] Every suit shall be instituted by the presentation of a plaint or in such
other manner as may be prescribed.

2[(2) In every plaint, facts shall be proved by affidavit.]

 *[Provided that such an affidavit shall be in the form and manner as prescribed under Order VI of
Rule 15A.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-27', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 27 — Summons to defendants', '27. Summons to defendants
Where a suit has been duly instituted, a summons may be issued to
the defendant to appear and answer the claim and may be served in manner prescribed 1
[on such day not
beyond thirty days from date of the institution of the suit.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-28', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 28 — Service of summons where defendant resides in another State', '28. Service of summons where defendant resides in another State
(1) A summons may be sent for service in another State to such Court and in such manner as may be prescribed by rules in force in that State.

(2) The Court to which such summons is sent shall, upon receipt thereof, proceed as if it had been issued by such Court and shall then return the summons to the Court of issue together with the record (if any) of its proceedings with regard thereto.

1[(3) Where the language of the summons sent for service in another State is different from the language of the record referred to in sub-section (2), a translation of the record,—

(a) in Hindi, where the language of the Court issuing the summons is Hindi, or

(b) in Hindi or English where the language of such record is other than Hindi or English,

shall also be sent together with the record sent under that sub-section.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-29', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 29 — Service of foreign summonses', '29. Service of foreign summonses
1[29. Service of foreign summonses.-- Summonses and other processes issued by


(a) any Civil or Revenue Court established in any part of India to which the provisions of this
Code do not extend, or


(b) any Civil or Revenue Court established or continued by the authority of the Central
Government outside India, or


(c) any other Civil or Revenue Court outside India to which the Central Government has, by
notification in the Official Gazette, declared the provisions of this section to apply,


may be sent to the Courts in the territories to which this Code extends, and served as if they were
summonses issued by such Courts.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-30', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 30 — Power to order discovery and the like', '30. Power to order discovery and the like
Subject to such conditions and limitations as may be
prescribed, the Court may, at any time, either of its own motion or on the application of any party,—

(a) make such orders as may be necessary or reasonable in all matters relating to the delivery and
answering of interrogatories, the admission of documents and facts, and the discovery, inspection,
production, impounding and return of documents or other material objects producible as evidence;

(b) issue summonses to persons whose attendance is required either to give evidence or to
produce documents or such other objects as aforesaid;

(c) order any fact to be proved by affidavit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-31', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 31 — Summons to witness', '31. Summons to witness
The provisions in sections 27, 28 and 29 shall apply to summonses to give evidence or to produce documents or other material objects.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-32', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 32 — Penalty for default', '32. Penalty for default
The Court may compel the attendance of any person to whom a summons
has been issued under section 30 and for that purpose may

(a) issue a warrant for his arrest;

(b) attach and sell his property; 

(c) impose a fine upon him 1
[not exceeding five thousand rupees];

(d) order him to furnish security for his appearance and in default commit him to the civil prison.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-33', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 33 — Judgment and decree', '33. Judgment and decree
The Court, after the case has been heard, shall pronounce judgment, and on such judgment a decree shall follow.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-34', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 34 — Interest', '34. Interest
(1) Where and in so far as a decree is for the payment of money, the Court may, in the decree, order interest at such rate as the Court deems reasonable to be paid on the principal sum adjudged, from the date of the suit to the date of the decree, in addition to any interest adjudged on such principal sum for any period prior to the institution of the suit, 1 [with further interest at such rate not exceeding six per cent. per annum as the Court deems reasonable on such principal sum], from the date of the decree to the date of payment, or to such earlier date as the Court thinks fit :

2[Provided that where the liability in relation to the sum so adjudged had arisen out of a commercial transaction, the rate of such further interest may exceed six per cent. per annum, but shall not exceed the contractual rate of interest or where there is no contractual rate, the rate at which moneys are lent or advanced by nationalised banks in relation to commercial transactions.

Explanation I.--In this Sub-section, "nationalised bank" means a corresponding new bank as defined in the Banking Companies (Acquisition and Transfer of Undertakings) Act, 1970 (5 of 1970).

Explanation II.-- For the purposes of this section, a transaction is a commercial transaction, if it is connected with the industry, trade or business of the party incurring the liability.]

(2) Where such a decree is silent with respect to the payment of further interest 3[on such principal sum] from the date of the decree to the date of payment or other earlier date, the Court shall be deemed to have refused such interest, and a separate suit therefor shall not lie.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-35', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 35 — Costs', '35. Costs
(1) Subject to such conditions and limitations as may be prescribed, and to the provisions of any
law for the time being in force, the costs of an incident to all suits shall be in the discretion of the Court, and the
Court shall have full power to determine by whom or out of what property and to what extent such costs are to be
paid, and to give all necessary directions for the purposes aforesaid. The fact that the Court has no jurisdiction to
try the suit shall be no bar to the exercise of such powers.

(2) Where the Court directs that any costs shall not follow the event, the Court shall state its reasons in
writing.

1* * * * * 

*[35. Costs.(1) In relation to any commercial dispute, the Court, notwithstanding anything contained in
any other law for the time being in force or Rule, has the discretion to determine:


(a) whether costs are payable by one party to another;


(b) the quantum of those costs; and


(c) when they are to be paid.


Explanation.-- For the purpose of clause (a), the expression costs shall mean reasonable costs
relating to-- 


(i) the fees and expenses of the witnesses incurred;


(ii) legal fees and expenses incurred;


(iii) any other expenses incurred in connection with the proceedings.


(2) If the Court decides to make an order for payment of costs, the general rule is that the unsuccessful
party shall be ordered to pay the costs of the successful party: 


Provided that the Court may make an order deviating from the general rule for reasons to be recorded in
writing.


Illustration


The Plaintiff, in his suit, seeks a money decree for breach of contract, and damages. The Court holds that the
Plaintiff is entitled to the money decree. However, it returns a finding that the claim for damages is frivolous and
vexatious.


In such circumstances the Court may impose costs on the Plaintiff, despite the Plaintiff being the successful
party, for having raised frivolous claims for damages.


(3) In making an order for the payment of costs, the Court shall have regard to the following circumstances,
including--


(a) the conduct of the parties;


(b) whether a party has succeeded on part of its case, even if that party has not been wholly successful;


(c) whether the party had made a frivolous counterclaim leading to delay in the disposal of the case;


(d) whether any reasonable offer to settle is made by a party and unreasonably refused by the other party;
and


(e) whether the party had made a frivolous claim and instituted a vexatious proceeding wasting the time of
the Court.


(4) The orders which the Court may make under this provision include an order that a party must pay--


(a) a proportion of another partys costs;


(b) a stated amount in respect of another partys costs;


(c) costs from or until a certain date;


(d) costs incurred before proceedings have begun;


(e) costs relating to particular steps taken in the proceedings;


(f) costs relating to a distinct part of the proceedings; and


 (g) interest on costs from or until a certain date.]

STATE AMENDMENTS
Jammu and Kashmir and Ladakh (UTs).--


In Section 35, in sub-section (1) omit "Commercial". 
[Vide the Jammu and Kashmir Reorganisation (Adaptation of Central Laws) Order, 2020, notification
No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation (Adaptation of
Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020).]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-35A', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 35A — Compensatory costs in respect of false or vexatious claims or defences', '35A. Compensatory costs in respect of false or vexatious claims or defences
1[35A. Compensatory costs in respect of false or vexatious claims or defences.-- (1) If in any suit or other proceedings 2[including an execution proceeding but 3[excluding an appeal or a revision] any party objects to the claim or defence on the ground that the claim or defence or any part of it is, as against the objector, false or vexatious to the knowledge of the party by whom it has been put forward, and if thereafter, as against the objector, such claim or defence is disallowed, abandoned or withdrawn in whole or in part, the Court, 4[if it so thinks fit], may, after recording its reasons for holding such claim or defence to be false or vexatious, make an order for the payment to the object or by the party by whom such claim or defence has been put forward, of cost by way of compensation.

*[(2) No Court shall make any such order for the payment of an amount exceeding 5[three thousand rupees] or exceeding the limits of its pecuniary jurisdiction, whichever amount is less:

Provided that where the pecuniary limits of the jurisdiction of any Court excercising the jurisdiction of a Court of Small Causes under the Provincial Small Cause Courts Act, 1887 (9 of 1887), 6[or under a corresponding law in force in 7[any part of India to which the said Act does not extend]] and not being a Court constituted 8[under such Act or law], are less than two hundred and fifty rupees, the High Court may empower such Court to award as costs under this section any amount not exceeding two hundred and fifty rupees and not exceeding those limits by more than one hundred rupees :

Provided, further, that the High Court may limit the amount which any Court or class of Courts is empowered to award as costs under this section.]

(3) No person against whom an order has been made under this section shall, by reason thereof, be exempted from any criminal liability in respect of any claim or defence made by him.

(4) The amount of any compensation awarded under this section in respect of a false or vexatious claim or defence shall be taken into account in any subsequent suit for damages or compensation in respect of such claim or defence.]

STATE AMENDMENTS

Jammu and Kashmir and Ladakh (UTs).--

In Section 35A, omit sub-section (2).

[Vide the Jammu and Kashmir Reorganization (Adaptation of Central Laws) Order, 2020, notification No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation (Adaptation of Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020).]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-35B', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 35B — Costs for causing delay', '35B. Costs for causing delay
1[35B. Costs for causing delay.-- (1) If, on any date fixed for the hearing of a suit or for taking any step therein, a party to the suit

(a) fails to take the step which he was required by or under this Code to take on that date, or
(b) obtains an adjournment for taking such step or for producing evidence or on any other ground, the Court may, for reasons to be recorded, make an order requiring such party to pay to the other party such costs as would, in the opinion of the Court, be reasonably sufficient to reimburse the other party in respect of the expenses incurred by him in attending the Court on that date, and payment of such costs, on the date next following the date of such order, shall be a condition precedent to the further prosecution of

(a) the suit by the plaintiff, where the plaintiff was ordered to pay such costs,

(b) the defence by the defendant, where the defendant was ordered to pay such costs.

Explanation.-- Where separate defences have been raised by the defendant or groups of defendants, payment of such costs shall be a condition precedent to the further prosecution of the defence by such defendants or groups of defendants as have been ordered by the Court to pay such costs.

(2) The costs, ordered to be paid under sub-section (1), shall not, if paid, be included in the costs awarded in the decree passed in the suit; but, if such costs are not paid, a separate order shall be drawn up indicating the amount of such costs and the names and addresses of the persons by whom such costs are payable and the order so drawn up shall be executable against such persons.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-36', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 36 — Application to orders', '36. Application to orders
1[36. Application to orders.-- The provisions of this Code relating to the execution of decrees (including provisions relating to payment under a decree) shall, so far as they are applicable, be deemed to apply to the execution of orders (including payment under an order).]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-37', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 37 — Definition of Court which passed a decree', '37. Definition of Court which passed a decree
The expression "Court which passed a decree," or words to that effect, shall, in relation to the execution of decrees, unless there is anything repugnant in the subject or context, be deemed to include,

(a) where the decree to be executed has been passed in the exercise of appellate jurisdiction, the Court of first instance, and

(b) where the Court of first instance has ceased to exist or to have jurisdiction to execute it, the Court which, if the suit wherein the decree was passed was instituted at the time of making the application for the execution of the decree, would have jurisdiction to try such suit.

1[Explanation.-- The Court of first instance does not cease to have jurisdiction to execute a decree merely on the ground that after the institution of the suit wherein the decree was passed or after the passing of the decree, any area has been transferred from the jurisdiction of that Court to the jurisdiction of any other Court; but, in every such case, such other Court shall also have jurisdiction to execute the decree, if at the time of making the application for execution of the decree it would have jurisdiction to try the said suit.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-38', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 38 — Court by which decree may be executed', '38. Court by which decree may be executed
A decree may be executed either by the Court which passed it, or by the Court to which it is sent for execution.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-39', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 39 — Transfer of decree', '39. Transfer of decree
(1) The Court which passed a decree may, on the application of the decreeholder, send it for execution to another Court 1
[of competent jurisdiction], 

(a) if the person against whom the decree is passed actually and voluntarily resides or carries on
business, or personally works for gain, within the local limits of the jurisdiction of such other Court, or

(b) if such person has not property within the local limits of the jurisdiction of the Court which
passed the decree sufficient to satisfy such decree and has property within the local limits of the
jurisdiction of such other Court, or

(c) if the decree directs the sale or delivery of immovable property situate outside the local limits of
the jurisdiction of the Court which passed it, or

(d) if the Court which passed the decree considers for any other reason, which it shall record in
writing, that the decree should be executed by such other Court.

(2) The Court which passed a decree may of its own motion send it for execution to any subordinate
Court of competent jurisdiction.

1[(3) For the purposes of this section, a Court shall be deemed to be a Court of competent jurisdiction if, at
the time of making the application for the transfer of decree to it, such Court would have jurisdiction to try the
suit in which such decree was passed.]

2[(4) Nothing in this section shall be deemed to authorise the Court which passed a decree to execute
such decree against any person or property outside the local limits of its jurisdiction.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-40', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 40 — Transfer of decree to Court in another State', '40. Transfer of decree to Court in another State
Where a decree is sent for execution in another State, it shall be sent to such Court and executed in such manner as may be prescribed by rules in force in that State.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-41', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 41 — Result of execution proceedings to be certified', '41. Result of execution proceedings to be certified
The Court to which a decree is sent for execution shall certify to the Court which passed it the fact of such execution, or where the former Court fails to execute the same the circumstances attending such failure.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-42', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 42 — Powers of Court in executing transferred decree', '42. Powers of Court in executing transferred decree
1[(1)] The Court executing a decree sent to it shall
have the same powers in executing such decree as if it had been passed by itself. All persons is disobeying or
obstructing the execution of the decree shall be punishable by such Court in the same manner as if it had passed
the decree. And its order in executing such decree shall be subject to the same rules in respect of appeal as
if the decree had passed by itself.

2[(2) Without prejudice to the generality of the provisions of sub-section (1), the powers of the Court
under that sub-section shall include the following powers of the Court which passed the decree, namely: --


(a) power to send the decree for execution to another Court under section 39; 

(b) power to execute the decree against the legal representative of the deceased judgment-debtor
under section 50;

(c) power to order attachment of a decree.

(3) A Court passing an order in exercise of the powers specified in sub-section (2) shall send a copy
thereof to the Court which passed the decree.

(4) Nothing in this section shall be deemed to confer on the Court to which a decree is sent for
execution any of the following powers, namely:-- 


(a) power to order execution at the instance of the transferee of the decree ;

(b) in the case of a decree passed against a firm, power to grant leave to execute such decree
against any person, other than such a person as is referred to in clause (b),or clause (c), of sub-rule (1)
of rule 50 of Order XXI.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-43', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 43 — Execution of decrees passed by Civil Courts in places to which this Code does not extend', '43. Execution of decrees passed by Civil Courts in places to which this Code does not extend
1[43. Execution of decrees passed by Civil Courts in places to which this Code does not extend.-- Any decree passed by any Civil Court established in any part of India to which the provisions of this Code do not extend, or by any Court established or continued by the authority of the Central Government outside India, may, if it cannot be executed within the jurisdiction of the Court by which it was passed, be executed in the manner herein provided within the jurisdiction of any Court in the territories to which this Code extends.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-44', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 44 — Execution of decrees passed by Revenue Courts in places to which this Code does not extend', '44. Execution of decrees passed by Revenue Courts in places to which this Code does not extend
1[44. Execution of decrees passed by Revenue Courts in places to which this Code does not extend.-- The State Government may, by notification in the Official Gazette, declare that the decrees of any Revenue Court in any part of India to which the provisions of this Code do not extend, or any class of such decrees, may be executed in the State as if they had been passed by Courts in that State.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-44A', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 44A — Execution of decrees passed by Courts in reciprocating territory', '44A. Execution of decrees passed by Courts in reciprocating territory
1[44A. Execution of decrees passed by Courts in reciprocating territory.--(1) Where a certified
copy of a decree of any of the superior Courts of 2
*** any reciprocating territory has been filed in a
District Court, the decree may be executed in 3
[India] as if it had been passed by the District Court.

(2) Together with the certified copy of the decree shall be filed a certificate from such superior Court
stating the extent, if any, to which the decree has been satisfied or adjusted and such certificate shall, for the
purposes of proceedings under this section, be conclusive proof of the extent of such satisfaction or
adjustment.

(3) The provisions of section 47 shall as from the filing of the certified copy of the decree apply to the
proceedings of a District Court executing a decree under this section, and the District Court shall refuse
execution of any such decree, if it is shown to the satisfaction of the Court that the decree falls within any
of the exceptions specified in clauses (a) to (f) of section 13.

4[Explanation 1.-- "Reciprocating territory" means any country or territory outside India which the
Central Government may, by notification in the Official Gazette, declare to be a reciprocating territory for
the purposes of this section; and superior Courts, with reference to any such territory, means such
Courts as may be specified in the said notification.

Explanation 2.-- "Decree" with reference to a superior Court means any decree or judgment of such
Court under which a sum of money is payable, not being a sum payable in respect of taxes or other
charges of a like nature or in respect of a fine or other penalty, but shall in no case include an arbitration
award, even if such an award is enforceable as a decree or judgment.]]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-45', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 45 — Execution of decrees outside India', '45. Execution of decrees outside India
1[45. Execution of decrees outside India.-- So much of the foregoing sections of this Part as empowers a Court to send a decree for execution to another Court shall be construed as empowering a Court in any State to send a decree for execution to any Court established 2 *** by the authority of the Central Government 3 [outside India] to which the State Government has by notification in the Official Gazette declared this section to apply.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-46', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 46 — Precepts', '46. Precepts
(1) Upon the application of the decree-holder the Court which passed the decree may. whenever it thinks fit, issue a precept to any other Court which would be competent to execute such decree to attach any property belonging to the judgment-debtor and specified in the precept.

(2) The Court to which a precept is sent shall proceed to attach the property in the manner prescribed in regard to the attachment of property in execution of a decree:

Provided that no attachment under a precept shall continue for more than two months unless the period of attachment is extended by an order of the Court which passed the decree or unless before the determination of such attachment the decree has been transferred to the Court by which the attachment has been made and the decree-holder has applied for an order for the sale of such property.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-47', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 47 — Questions to be determined by the Court executing decree', '47. Questions to be determined by the Court executing decree
(1) All questions arising between the parties to the suit in which the decree was passed, or their representatives, and relating to the execution, discharge or satisfaction of the decree, shall be determined by the Court executing the decree and not by a separate suit.

1* * * * *

(3) Where a question arises as to whether any person is or is not the representative of a party, such question shall, for the purposes of this section, be determined by the Court.

2[Explanation 1.-- For the purposes of this section, a plaintiff whose suit has been dismissed and a defendant against whom a suit has been dismissed are parties to the suit.

Explanation II.-- (a) For the purposes of this section, a purchaser of property at a sale in execution of a decree shall be deemed to be a party to the suit in which the decree is passed; and

(b) all questions relating to the delivery of possession of such property to such purchaser or his representative shall be deemed to be questions relating to the execution, discharge or satisfaction of the decree within the meaning of this section.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-48', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 48 — [Repealed]', '48. [Repealed]
[Execution barred in certain cases.] Rep. by the Limitation Act, 1963 (36 of 1963), s. 28 (w.e.f.1-1- 1964).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-49', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 49 — Transferee', '49. Transferee
Every transferee of a decree shall hold the same subject to the equities (if any) which the judgment-debtor might have enforced against the original decree-holder.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-50', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 50 — Legal representative', '50. Legal representative
(1) Where a judgment-debtor dies before the decree has been fully satisfied,
the holder of the decree may apply to the Court which passed it to execute the same against the legal
representative of the deceased.

(2) Where the decree is executed against such legal representative, he shall be liable only to the extent of
the property of the deceased which has come to his hands and has not been duly disposed of; and, for the
purpose of ascertaining such liability, the Court executing the decree may, of its own motion or on the
application of the decree-holder, compel such legal representative to produce such accounts as it thinks
fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-51', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 51 — Powers of Court to enforce execution', '51. Powers of Court to enforce execution
Subject to such conditions and limitations as may be prescribed, the Court may, on the application of the decree-holder, order execution of the decree

(a) by delivery of any property specifically decreed;

(b) by attachment and sale or by the sale without attachment of any property;

(c) by arrest and detention in prison 1[for such period not exceeding the period specified in section 58, where arrest and detention is permissible under that section];

(d) by appointing a receiver; or

(e) in such other manner as the nature of the relief granted may require :

2[Provided that, where the decree is for the payment of money, execution by detention in prison shall not be ordered unless, after giving the judgment-debtor an opportunity of showing cause why he should not be committed to prison, the Court, for reasons recorded in writing, is satisfied--

(a) that the judgment-debtor, with the object or effect of obstructing or delaying the execution of the decree,--

(i) is likely to abscond or leave the local limits of the jurisdiction of the Court, or

(ii) has, after the institution of the suit in which the decree was passed, dishonestly transferred, concealed, or removed any part of his property, or committed any other act of bad faith in relation to his property, or

(b) that the judgment-debtor has, or has had since the date of the decree. the means to pay the amount of the decree or some substantial part thereof and refuses or neglects or has refused or neglected to pay the same, or

(c) that the decree is for a sum for which the judgment-debtor was bound in a fiduciary capacity to account.

Explanation. In the calculation of the means of the judgment-debtor for the purposes of clause (b), there shall be left out of account any property which, by or under any law or custom having the force of law for the time being in force, is exempt from attachment in execution of the decree.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-52', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 52 — Enforcement of decree against legal representative', '52. Enforcement of decree against legal representative
(1) Where a decree is passed against a party as the legal representative of a deceased person, and the decree is for the payment of money out of the property of the deceased, it may be executed by the attachment and sale of any such property.

(2) Where no such property remains in the possession of the judgment-debtor and he fails to satisfy the Court that he has duly applied such property of the deceased as is proved to have come into his possession, the decree may be executed against the judgment-debtor to the extent of the property in respect of which he has failed so to satisfy the Court in the same manner as if the decree had been against him personally.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-53', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 53 — Liability of ancestral property', '53. Liability of ancestral property
For the purposes of section 50 and section 52, property in the hands of a son or other descendant which is liable under Hindu law for the payment of the debt of a deceased ancestor, in respect of which a decree has been passed, shall be deemed to be property of the deceased which has come to the hands of the son or other descendant as his legal representative.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-54', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 54 — Partition of estate or separation of share', '54. Partition of estate or separation of share
Where the decree is for the partition of an undivided estate assessed to the payment of revenue to the Government, or for the separate possession of a share of such an estate, the partition of the estate or the separation of the share shall be made by the Collector or any gazetted subordinate of the Collector deputed by him in this behalf, in accordance with the law (if any) for the time being in force relating to the partition, or the separate possession of shares, of such estates.

STATE AMENDMENTS

Karnataka.--

For Section 54, the following Section shall be substituted, namely.--

"54. Partition of estate or separation of share.--Where the decree is for the partition of an undivided estate assessed to the payment of revenue to the Government, or for the separate possession of a share of such an estate, the partition of the estate or the separation of the share of such an estate shall be made by the Court in accordance with the law if any, for the time being in force relating to the partition or the separate possession of shares, and if necessary on the report of a revenue officer, not below the rank of Tahsildar or such other person as the Court may appoint as Commissioner in that behalf."

[Vide Karnataka Act 36 of 1998, sec. 2.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-55', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 55 — Arrest and detention', '55. Arrest and detention
(1) A judgment-debtor may be arrested in execution of a decree at, any hour and on any day, and shall, as soon as practicable, be brought before the Court, and his detention may be in the civil prison of the district in which the Court ordering the detention is situate, or, where such civil prison does not afford suitable accommodation, in any other place which the State Government may appoint for the detention of persons ordered by the Courts of such district to be detained:

Provided, firstly that, for the purpose of making an arrest under this section, no dwelling-house shall be entered after sunset and before sunrise:

Provided, secondly, that no outer door of a dwelling-house shall be broken open unless such dwellinghouse is in the occupancy of the judgment-debtor and he refuses or in any way prevents access thereto, but when the officer authorized to make the arrest has duly gained access to any dwelling-house, he may break open the door of any room in which he has reason to believe the judgment-debtor is to be found:

Provided, thirdly that, if the room is in the actual occupancy of a woman who is not the judgment-debtor and who according to the customs of the country does not appear in public, the officer authorized to make the arrest shall give notice to her that she is at liberty to withdraw, and, after allowing a reasonable time for her to withdraw and giving her reasonable facility for withdrawing, may enter the room for the purpose of making the arrest:

Provided, fourthly, that, where the decree in execution of which a judgment-debtor is arrested, is a decree for the payment of money and the judgment-debtor pays the amount of the decree and the costs of the arrest to the officer arresting him, such officer shall at once release him.

(2) The State Government may, by notification in the Official Gazette, declare that any person or class of persons whose arrest might be attended with danger or inconvenience to the public shall not be liable to arrest in execution of a decree otherwise than in accordance with such procedure as may be prescribed by the State Government in this behalf.

(3) Where a judgment-debtor is arrested in execution of a decree for the payment of money and brought before the Court, the Court shall inform him that he may apply to be declared an insolvent, and that he 1 [may be discharged] if he has not committed any act of bad faith regarding the subject of the application and if he complies with the provisions of the law of insolvency for the time being in force.

(4) Where a judgment-debtor expresses his intention to apply to be declared an insolvent and furnishes security, to the satisfaction of the Court, that he will within one month so apply, and that he will appear, when called upon, in any proceeding upon the application or upon the decree in execution of which he was arrested, the Court 2 [may release] him from arrest, and, if he fails so to apply and to appear, the Court may either direct the security to be realized or commit him to the civil prison in execution of the decree.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-56', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 56 — Prohibition of arrest or detention of women in execution of decree for money', '56. Prohibition of arrest or detention of women in execution of decree for money
Notwithstanding anything in this Part, the Court shall not order the arrest or detention in the civil prison of a woman in execution of a decree for the payment of money.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-57', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 57 — Subsistence-allowance', '57. Subsistence-allowance
The State Government may fix scales, graduated according to rank, race and nationality, of monthly allowances payable for the subsistence of judgment-debtors.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-58', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 58 — Detention and release', '58. Detention and release
(1) Every person detained in the civil prison in execution of a decree shall be so detained,

(a) where the decree is for the payment of a sum of money exceeding 1 [2 [five thousand rupees], for a period not exceeding three months, and,]

3[(b) where the decree is for the payment of a sum of money exceeding two thousand rupees, but not exceeding five thousand rupees, for a period not exceeding six weeks.]

4(1A) For the removal of doubts, it is hereby declared that no order for detention of the judgmentdebtor in civil prison in execution of a decree for the payment of money shall be made, where the total amount of the decree does not exceed 5 [two thousand rupees.]

(2) A judgment-debtor released from detention under this section shall not merely by reason of his release be discharged from his debt, but he shall not be liable to be re-arrested under the decree in execution of which he was detained in the civil prison.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-59', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 59 — Release on ground of illness', '59. Release on ground of illness
(1) At any time after a warrant for the arrest of a judgment-debtor has been issued the Court may cancel it on the ground of his serious illness.

(2) Where a judgment-debtor has been arrested, the Court may release him if, in its opinion, he is not in a fit state of health to be detained in the civil prison.

(3) Where a judgment-debtor has been committed to the civil prison, he may be released therefrom--

(a) by the State Government, on the ground of the existence of any infectious or contagious disease, or

(b) by the committing Court, or any Court to which that Court is subordinate, on the ground of his suffering from any serious illness.

(4) A judgment-debtor released under this section may be re-arrested, but the period of his detention in civil prison shall not in the aggregate exceed that prescribed by section 58.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-60', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 60 — Property liable to attachment and sale in execution of decree', '60. Property liable to attachment and sale in execution of decree
1(1) The following property is liable to attachment and sale in execution of a decree, namely, lands, houses or other buildings, goods, money, bank-notes, cheques, bills of exchange, hundis, promissory notes, Government securities, bonds or other securities for money, debts, shares in a corporation and, save as hereinafter mentioned, all other saleable property, movable or immovable, belonging to the judgment-debtor, or over which, or the profits of which, he has a disposing power which he may exercise for his own benefit, whether the same be held in the name of the judgment-debtor or by another person in trust for him or on his behalf:

Provided that the following particulars shall not be liable to such attachment or sale, namely:

(a) the necessary wearing-apparel, cooking vessels, beds and bedding of the judgment-debtor, his wife and children, and such personal ornaments as, in accordance with religious usage, cannot be parted with by any woman;

(b) tools of artisans, and, where the judgment-debtor is an agriculturist, his implements of husbandry and such cattle and seed-grain as may, in the opinion of the Court, be necessary to enable him to earn his livelihood as such, and such portion of agricultural produce or of any class of agricultural produce as may have been declared to be free from liability under the provisions of the next following section;

(c) houses and other buildings (with the materials and the sites thereof and the land immediately appurtenant thereto and necessary for their enjoyment) belonging to 2 [an agriculturist or a labourer of a domestic servant] and occupied by him ;

(d) books of account ;

(e) a mere right to sue for damages ;

(f) any right of personal service ;

(g) stipends and gratuities allowed to pensioners of the Government 3 [or of a local authority or of any other employer], or payable out of any service family pension fund 4 notified in the Official Gazette by 5 [the Central Government or the State Government] in this behalf, and political pensions;

6 [(h) the wages of labourers and domestic servants, whether payable in money or in kind;

7 ***

8 [(i) salary to the extent of 9 [the first 10 [one thousand rupees] and two third of the remainder] 11[in execution of any decree other than a decree for maintenance]:

12[Provided that where any part of such portion of the salary as is liable to attachment has been under attachment, whether continuously or intermittently, for a total period of twenty-four months, such portion shall be exempt from attachment until the expiry of a further period of twelve months, and, where such attachment has been made in execution of one and the same decree, shall, after the attachment has continued for a total period of twenty-four months, be finally exempt from attachment in execution of that deeree.]]

13[(ia) one-third of the salary in execution of any decree for maintenance;]

13[(j) the pay and allowances of persons to whom the Air Force Act, 1950 (45 of 1950) or the Army Act, 1950 (46 of 1950), or the Navy Act, 1957 (62 of 1957), applies;]

(k) all compulsory deposits and other sums in or derived from any fund to which the Provident Funds Act, 14[1925], (19 of 1925), for the time being applies in so far as they are declared by the said Act not to be liable to attachment;

9[(ka) all deposits and other sums in or derived from any fund to which the Public Provident Fund Act, 1968 (23 of 1968), for the time being applies, in so far as they are declared by the said Act as not to be liable to attachment;

(kb) all moneys payable under a policy of insurance on the life of the judgment debtor;

(kc) the interest of a lessee of a residential of building to which the provisions of law for the time being in force relating to control of rents and accommodation apply;]

15 [(1) any allowance forming part of the emoluments of any 16 [servant of the 17 [Government]] or of any servant of a railway company or local authority which the 18 [appropriate Government] may by notification in the Official Gazette declare to be exempt from attachment, and any subsistence grant or allowance made to 19 [any such servant] while under suspension;]

(m) an expectancy of succession by survivorship or other merely contingent or possible right or interest;

(n) a right to future maintenance;

(o) any allowance declared by 20 [any Indian law] to be exempt from liability to attachment or sale in execution of a decree, and

(p) where the judgment-debtor is a person liable for the payment of land-revenue, any movable property which, under any law for the time being applicable to him, is exempt from .sale for the recovery of an arrear of such revenue.

21 [Explanation 1. The moneys payable in relation to the matters mentioned in clauses (g), (h), (i), (ia), (j), (l) and (o) are exempt from attachment or sale, whether before or after they are actually payable, and, in the case of salary, the attachable portion thereof is liable to attachment whether before or after it is actually payable.]

22 [ 23 [Explanation II-- In clauses (i) and (ia)], "salary" means the total monthly emoluments, excluding any allowance declared exempt from attachment under the provisions of clause (1), derived by a person from his employment whether on duty or on leave.]

24[Explanation 25[III] -- In clause (1) appropriate Government means--

(i) as respects any 26[person] in the service of the Central Government, or any servant of 27[a Railway Administration] or of a cantonment authority or of the port authority of a major port, the Central Government;

28* * * * *

(iii) as respects any other 18 [servant of the 16 [Government]] or a servant of any other 29*** local authority, the State Government.]

29[Explanation IV.-- For the purposes of this proviso, " wages" includes bonus, and "abourer" includes a skilled unskilled or semi-skilled labourer.

Explanation V .-- For the purposes of this proviso, the expression agriculturist means a person who cultivates land personally and who depends for his livelihood mainly on the income from agricultural land, whether as owner, tenant, partner or agricultural labourer.

30Explanation VI.-- For the purposes of Explanation V an agriculturist shall be deemded to cultivate land-personally, if he cultivates land

(a) by his own labour, or

(b) by the labour of any member of his family, or

(c) by servants or labourers on wages payable in cash or in kind (not being as a share of the produce), or both.]

29[(IA) Notwithstanding anything contained in any other law for the time being in force, an agreement by which a person agrees to waive the benefit of any exemption under this section shall be void.]

(2) Nothing in this section shall be deemed 31 *** to exempt houses and other buildings (with the materials and the sites thereof and the lands immediately appurtenant thereto and necessary for their enjoyment) from attachment or sale in execution of decrees for rent of any such house, building, site or land 31***

32* * * * *

STATE AMENDMENTS

Kerala.---

In clause (g) of the Proviso to sub-section (1) of section 60, after the words stipends and gratuities allowed by pensioners of the Government the words or of a local authority shall be inserted.

[Vide Kerala Act 13 of 1957, sec. 3.]

In the proviso to sub section (1) of section 60 of the Code of Civil Procedure, 1908 (Central Act 5 of 1908), after clause (g), the following clause shall be inserted, namely: --

"(gg) all moneys payable to the beneficiaries under the Family Benefit Scheme for the employees of the Government of Kerala."

[Vide Kerala Act 1 of 1988, sec. 2.]

STATE AMENDMENTS

Himachal Pradesh.--

Amendment in section 60. -- (1) In Section 60 sub-section (1):

(i) at the end of clause (c), add the following:

or compensation paid for such houses and buildings (including compensation for the materials and the sites and the land referred to above) acquired for a public purpose;

(ii) after clause (c), the following clause shall be inserted, namely: --

(cc) compensation paid for agricultural lands belonging to agriculturists and acquired for a public purpose;

[Vide Himachal Pradesh Act 6 of 1956, sec. 2.]

Tamil Nadu

Amendment of section 60, Central Act V of 1908.--In clause (g) of the proviso to sub-section (1) of section 60 of the Code of Civil Procedure, 1908, after the words "stipends and gratuities allowed to pensioners of the Government", the words "or of a authority" shall be inserted.

[Vide Tamil Nadu Act XXXIV of 1950, s. 2]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-61', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 61 — Partial exemption of agricultural produce', '61. Partial exemption of agricultural produce
The State Government 1
*** may, by general or
special order published in the Official Gazette, declare that such portion of agricultural produce, or of any
class of agricultural produce, as may appear to the State Government to be necessary for the purpose of
providing until the next harvest for the due cultivation of the land and for the support of the judgmentdebtor and his family, shall, in the case of all agriculturists or of any class of agriculturists, be exempted
from liability to attachment or sale in execution of a decree.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-62', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 62 — Seizure of property in dwelling-house', '62. Seizure of property in dwelling-house
(I) No person executing any process under this Code directing or authorizing seizure of movable property shall enter any dwelling-house after sunset and before sunrise.

(2) No outer door of a dwelling-house shall be broken open unless such dwelling-house is in the occupancy of the judgment-debtor and he refuses or in any way prevents access thereto, but when the person executing any such process has duly gained access to any dwelling-house, he may break open the door of any room in which he has reason to believe any such property to be.

(3) Where a room in a dwelling-house is in the actual occupancy of a woman who, according to the customs of the country, does not appear in public, the person executing the process shall give notice to such woman that she is at liberty to withdraw; and, after allowing reasonable time for her to withdraw and giving her reasonable facility for withdrawing, he may enter such room for the purpose of seizing the property, using at the same time every precaution, consistent with these provisions, to prevent its clandestine removal.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-63', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 63 — Property attached in execution of decrees of several Courts', '63. Property attached in execution of decrees of several Courts
(1) Where property not in the custody of any Court is under attachment in execution of decrees of more Courts than one, the Court which shall receive or realize such property and shall determine any claim thereto and any objection to the attachment thereof shall be the Court of highest grade, or, where there is no difference in grade between such Courts, the Court under whose decree the property was first attached.

(2) Nothing in this section shall be deemed to invalidate any proceeding taken by a Court executing one of such decrees.

1[Explanation.-- For the purposes of sub-section (2), "proceeding taken by a Court" does not include an order allowing, to a decree-holder who has purchased property at a sale held in execution of a decree, set off to the extent of the purchase price payable by him.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-64', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 64 — Private alienation of property after attachment to be void', '64. Private alienation of property after attachment to be void
1[(1)] Where an attachment has been made, any private transfer or delivery of the property attached or of any interest therein and any payment to the judgment-debtor of any debt, dividend or other monies contrary to such attachment, shall be void as against all claims enforceable under the attachment.

2[(2) Nothing in this section shall apply to any private transfer or delivery of the property attached or of any interest therein, made in pursuance of any contract for such transfer or delivery entered into and registered before the attachment.]

Explanation.For the purpose of this section, claims enforceable under an attachment include claims for the rateable distribution of assets.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-65', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 65 — Purchaser''s title', '65. Purchaser''s title
Where immovable property is sold in execution of a decree and such sale has become absolute, the property shall be deemed to have vested in the purchaser from the time when the property is sold and not from the time when the sale becomes absolute.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-66', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 66 — [Repealed]', '66. [Repealed]
[Suit against purchaser not maintainable on ground of purchase being on behalf of plaintiff.]--Rep. by Act, 1988
(45 of 1988) , s. 7 (w.e.f. 19-5-1988).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-67', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 67 — Power for State Government to make rules as to sales of land in execution of decrees for payment of money', '67. Power for State Government to make rules as to sales of land in execution of decrees for payment of money
1[(1)] The State Government 2 *** may, by notification in the Official Gazette, make rules for any local area imposing conditions in respect of the sale of any class of interests in land in execution of decrees for the payment of money, where such interest are so uncertain or undetermined as, in the opinion of the State Government, to make it impossible to fix their value.

3[(2) When on the date on which this Code came into operation in any local area, any special rules as to sale of land in execution of decrees were in force therein, the State Government may, by notification in the Official Gazette declare such rules to be in force, or may 2 *** by a like notification, modify the same.

Every notification issued in the exercise of the powers conferred by this sub-section shall set out the rules so continued or modified.]

4[(3) Every rule made under this section shall be laid, as soon as may be after it is made, before the State Legislature.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-68', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 68 — [Repealed]', '68. [Repealed]
[Power to prescribe rules for transferring to collector execution of certain decrees.] — Rep. by the Code of Civil Procedure (Amendment) Act, 1956 (66 of 1956), s. 7.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-69', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 69 — [Repealed]', '69. [Repealed]
[Provisions of Third Schedule to apply.]— Rep. by s. 7 ibid. @/@') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-70', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 70 — [Repealed]', '70. [Repealed]
[Rules of Procedure.] — Rep. by s. 7 ibid.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-71', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 71 — [Repealed]', '71. [Repealed]
[Jurisdiction of Civil Courts barred.]— Rep. by s. 7 ibid.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-72', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 72 — [Repealed]', '72. [Repealed]
[Collector to deemed to be acting judicially.] — Rep. by s. 7 ibid.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-73', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 73 — Proceeds of execution sale to be rateably distributed among decree-holders', '73. Proceeds of execution sale to be rateably distributed among decree-holders
(1) Where assets are held by a Court and more persons than one have, before the receipt of such assets, made application to the Court for the execution of decrees for the payment of money passed against the same judgment-debtor and have not obtained satisfaction thereof, the assets, after deducting the costs of realization, shall be rateably distributed among all such persons :

Provided as follows:—

(a) where any property is sold subject to a mortgage or charge, the mortgage or incumbrancer shall not be entitled to share in any surplus arising from such sale;

(b) where any property liable to be sold in execution of a decree is subject to a mortgage or charge, the Court may, with the consent of the mortgagee or incumbrancer, order that the property be sold free from the mortgage or charge, giving to the mortgagee or incumbrancer the same interest in the proceeds of the sale as he had in the property sold;

(c) where any immovable property is sold in execution of a decree ordering its sale for the discharge of an in cumbrance thereon, the proceeds of sale shall be applied—

First, in defraying the expenses of the sale;

Secondly, in discharging the amount due under the decree;

thirdly, in discharging the interest and principal monies due on subsequent incumbrances (if any); and

fourthly, rateably among the holders of decrees for the payment of money against the judgement-debtor, who have, prior to the sale of the property, applied to the Court which passed the decree ordering such sale for execution of such decrees, and have no obtained satisfaction thereof.

(2) Where all or any of the assets liable to be rateably distributed under this section are paid to a person not entitled to receive the same, any person so entitled may sue such person to compel him to refund the assets.

(3) Nothing in this section affects any right of the Government.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-74', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 74 — Resistance to execution', '74. Resistance to execution
Where the Court is satisfied that the holder of a decree for the possession of immovable property or that the purchaser of immovable property sold in execution of a decree has been resisted or obstructed in obtaining possession of the property by the judgment-debtor or some person on his behalf and that such resistance or obstruction was without any just cause, the Court may, at the instance of the decree-holder or purchaser, order the judgment-debtor or such other person to be detained in the civil prison for a term which may extend to thirty days and may further direct that the decree-holder or purchaser be put into possession of the property.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-75', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 75 — Power of Court to issue commissions', '75. Power of Court to issue commissions
Subject to such conditions and limitations as may be prescribed, the Court may issue a commission

(a) to examine any person;

(b) to make a local investigation;

(c) to examine or adjust accounts; or

(d) to make a partition;

1[(e) to hold a scientific, technical, or expert investigation;

(f) to conduct sale of property which is subject to speedy and natural decay and which is in the custody of the Court pending the determination of the suit;

(g) to perform any ministerial act.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-76', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 76 — Commission to another Court', '76. Commission to another Court
(1) A commission for the examination of any person may be issued to any Court (not being a High Court) situate in a State other than the State in which the Court of issue is situate and having jurisdiction in the place in which the person to be examined resides.

(2) Every Court receiving a commission for the examination of any person under sub-section (1) shall examine him or cause him to be examined pursuant thereto, and the commission, when it has been duly executed, shall be returned together with the evidence taken under it to the Court from which it was issued, unless the order for issuing the commission has otherwise directed, in which case the commission shall be returned in terms of such order.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-77', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 77 — Letter of request', '77. Letter of request
In lieu of issuing a commission the Court may issue a letter of request to
examine a witness residing at any place not within 1
[India]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-78', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 78 — Commissions issued by foreign Courts', '78. Commissions issued by foreign Courts
1[78. Commissions issued by foreign Courts.-- Subject to such conditions and limitations as may be prescribed the provisions as to the execution and return of commissions for the examination of witnesses shall apply to commissions issued by or at the instance of

(a) Courts situate in any part of India to which the provisions of this Code do not extend; or

(b) Courts established or continued by the authority of the Central Government outside India; or

(c) Courts of any State or country outside India.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-79', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 79 — Suits by or against Government', '79. Suits by or against Government
1[79. Suits by or against Government.--In a suit by or against the Government, the authority to be named as plaintiff or defendant, as the case may be, shall be

(a) in the case of a suit by or against the Central Government, 2[the Union of India], and

(b) in the case of a suit by or against a State Government, the State.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-80', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 80 — Notice', '80. Notice
1 [(1)] 2 [ Save as otherwise provided in sub-section (2), no suits 3 [shall be instituted] against the Government (including the Government of the State of Jammu and Kashmir)] or against a public officer in respect of any act purporting to be done by such public officer in his official capacity, until the expiration of two months next after notice in writing has been 4 [delivered to, or left at the office of]

(a) in the case of a suit against the Central Government, 5 [except where it relates to a railway] a Secretary to that Government;

6[(b)] in the case of a suit against the Central Government where it relates to railway, the General Manager of that railway;

7[(bb) in the case of a suit against the Government of the State of Jammu and Kashmir, the Chief Secretary to that Government or any other officer authorized by that Government in this behalf;]

(c) in the case of a suit against 8[any other State Government], a Secretary to that Government or the Collector of the district; 9***

10* * * * *

and, in the case of a public officer, delivered to him or left at his office, stating the cause of action, the name, description and place of residence of the plaintiff and the relief which he claims; and the plaint shall contain a statement that such notice has been so delivered or left.

11[(2) A suit to obtain an urgent or immediate relief against the Government (including the Government of the State of Jammu and Kashmir) or any public officer in respect of any act purporting to be done by such public officer in his official capacity, may be instituted, with the leave of the Court, without serving any notice as required by sub-section (I); but the Court shall not grant relief in the suit, whether interim or otherwise, except after giving to the Government or public officer, as the case may be , a reasonable opportunity of showing cause in respect of the relief prayed for in the suit:

Provided that the Court shall, if it is satisfied, after hearing the parties, that no urgent or immediate relief need be granted in the suit, return the plaint for presentation to it after complying with the requirements of sub-section (1).

(3) No suit instituted against the Government or against a public officer in respect of any act purporting to be done by such public officer in his official capacity shall be dismissed merely by reason of any error or defect in the notice referred to in sub-section (I), if in such notice

(a) the name, description and the residence of the plaintiff had been so given as to enable the appropriate authority or the public officer to identify the person serving the notice and such notice had been delivered or left at the office of the appropriate authority specified in sub-section (1), and

(b) the cause of action and the relief claimed by the plaintiff had been substantially indicated.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-81', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 81 — Exemption from arrest and personal appearance', '81. Exemption from arrest and personal appearance
In a suit instituted against a public officer in respect of any act purporting to be done by him in his official capacity—

(a) the defendant shall not be liable to arrest nor his property to attachment otherwise than in execution of a decree, and,

(b) where the Court is satisfied that the defendant cannot absent himself from his duty without detriment to the public service, it shall exempt him from appearing in person..') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-82', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 82 — Execution of decree', '82. Execution of decree
1[(I) Where, in a suit by or against the Government or by or against a public officer in respect of any act purporting to be done by him in his official capacity, a decree is passed against the Union of India or a State or, as the case may be, the public officer, such decree shall not be executed except in accordance with the provisions of sub-section (2).]

(2) Execution shall not be issued on any such decree unless it remains unsatisfied for the period of three months computed from the date of 2 [such decree.]

3[(3) The provisions of sub-sections (1) and (2) shall apply in relation to an order or award as they apply in relation to a decree, if the order or award —

(a) is passed or made against 4 [the Union of India or a State or a public officer in respect of any such act as aforesaid, whether by a Court or by any other authority; and

(b) is capable of being executed under the provisions of this Code or of any other law for the time being in force as if it were a decree.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-83', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 83 — When aliens may sue', '83. When aliens may sue
1Alien enemies residing in India with the permission of the Central Government, and alien friends, may sue in any Court otherwise competent to try the suit, as if they were citizens of India, but alien enemies residing in India without such permission, or residing in a foreign country, shall not sue in any such Court.

Explanation.-- Every person residing in a foreign country, the Government of which is at war with India and carrying on business in that country without a licence in that behalf granted by the Central Government, shall, for the purpose of this section, be deemed to be an alien enemy residing in a foreign country.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-84', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 84 — When foreign States may sue', '84. When foreign States may sue
A foreign State may sue in any competent Court:

Provided that the object of the suit is to enforce a private right vested in the Ruler of such State or in any officer of such State in his public capacity.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-85', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 85 — Persons specially appointed by Government to prosecute or defend on behalf of foreign Rulers', '85. Persons specially appointed by Government to prosecute or defend on behalf of foreign Rulers
(1) The Central Government may, at the request of the Ruler of a foreign State or at the request of any person competent in the opinion of the Central Government to act on behalf of such Ruler, by order, appoint any persons to prosecute or defend any suit on behalf of such Ruler, and any persons so appointed shall be deemed to be the recognized agents by whom appearances, acts and applications under this Code may be made or done on behalf of such Ruler.

(2) An appointment under this section may be made for the purpose of a specified suit or of several specified suits, or for the purpose of all such suits as it may from time to time be necessary to prosecute or defend on behalf of such Ruler.

(3) A person appointed under this section may authorize or appoint any other persons to make appearances and applications and do acts in any such suit or suits as if he were himself a party thereto.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-86', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 86 — Suits against foreign Rulers, Ambassadors and Envoys', '86. Suits against foreign Rulers, Ambassadors and Envoys
(I) No. 1 *** foreign State may be sued in any Court otherwise competent to try the suit except with the consent of the Central Government certified in writing by a Secretary to that Government :

Provided that a person may, as a tenant of immovable property, sue without such consent as aforesaid 2[a foreign State] from whom he holds or claims to hold the property.

(2) Such consent may be given with respect to a specified suit or to several specified suits or with respect to all suits of any specified class or classes, and may specify, in the case of any suit or class of suits, the Court in which 3 [the foreign State] may be sued, but it shall not be given, unless it appears to the Central Government that 3 [the foreign State ]

(a) has instituted a suit in the Court against the person desiring to sue 4 [it], or

(b) by 5 [itself] or another, trades within the local limits of the jurisdiction of the Court, or

(c) is in possession of immovable property situate within those limits and is to be sued with reference to such property or for money charged thereon, or

(d) has expressly or impliedly waived the privilege accorded to 4 [it] by this section.

6[(3) Except with the consent of the Central Government, certified in writing by a Secretary to that Government, no decree shall be executed against the property of any foreign State.]

(4) The preceding provisions of this section shall apply in relation to

7[(a) any ruler of a foreign State;]

8[(aa)] any Ambassador or Envoy of a foreign State;

(b) any High Commissioner of a Commonwealth country; and

(c) any such member of the staff 9 [of the foreign State or the staff or retinue of the Ambassador] or Envoy of a foreign State or of the High Commissioner of a Commonwealth country as the Central Government may, by general or special order, specify in this behalf,

10[as they apply in relation to a foreign State.]

11[(5) The following persons shall not be arrested under this Code. namely:

(a) any Ruler of a foreign State;

(b) any Ambassador or Envoy of a foreign State;

(c) any High Commissioner of a Commonwealth country ;

(d) any such member of the staff of the foreign State or the staff or retinue of the Ruler, Ambassador or Envoy of a foreign State or of the High Commissioner of a Commonwealth country, as the Central Government may, by general or special order, specify in this behalf.

(6) Where a request is made to the Central Government for the grant of any consent referred to in subsection (1), the Central Government shall, before refusing to accede to the request in whole or in part, give to the person making the request a reasonable opportunity of being heard.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-87', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 87 — Style of foreign Rulers as parties to suits', '87. Style of foreign Rulers as parties to suits
The Ruler of a foreign State may sue, and shall be sued, in the name of his State:

Provided that in giving the consent referred to in section 86, the Central Government may direct that the Ruler may be sued in the name of an agent or in any other name.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-87A', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 87A — Definitions of foreign State and Ruler', '87A. Definitions of foreign State and Ruler
(1) In this Part,—

(a)“foreign State” means any State outside India which has been recognised by the Central Government; and

(b) “Ruler”, in relation to a foreign State, means the person who is for the time being recognized by the Central Government to be the head of that State.

(2) Every Court shall take judicial notice of the fact—

(a) that a State has or has not been recognized by the Central Government;

(b) that a person has or has not been recognized by the Central Government to be the head of a State.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-87B', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 87B — Application of sections 85 and 86 to Rulers of former Indian States', '87B. Application of sections 85 and 86 to Rulers of former Indian States
1[(I) In the case of any suit by or against the Ruler of any former Indian State which is based wholly or in part upon a cause of action which arose before the commencement of the Constitution or any proceeding arising out of such suit, the provisions of section 85 and sub-sections (1) and (3) of section 86 shall apply in relation to such Ruler as they apply in relation to the Ruler of a foreign State.]

(2) In this section

(a) "former Indian State" means any such Indian State as the Central Government may, by notification in the Official Gazette, specify for the purposes of this section; 2 ***

3[(b) "Commencement of the Constitution" means the 26th day of January, 1950; and

(c) "Ruler", in relation to a former Indian State, has the same meaning as in article 363 of the Constitution.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-88', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 88 — Where interpleader-suit may be instituted', '88. Where interpleader-suit may be instituted
Where two or more persons claim adversely to one another the same debts, sum of money or other property, movable or immovable, from another person, who claims no interest therein other than for charges or costs and who is ready to pay or deliver it to the rightful claimant, such other person may institute a suit of interpleader against all the claimants for the purpose of obtaining a decision as to the person to whom the payment or delivery shall be made and of obtaining indemnity for himself :

Provided that where any suit is pending in which the rights of all parties can properly be decided, no such suit of interpleader shall be instituted.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-89', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 89 — Settlement of disputes outside the Court', '89. Settlement of disputes outside the Court
1[89. Settlement of disputes outisde the Court.--(1) Where it appears to the Court that there exist elements of a settlement which may be acceptable to the parties, the Court shall formulate the terms of settlement and give them to the parties for their observations and after receiving the observations of the parties, the Court may reformulate the terms of a possible settlement and refer the same for:--

(a) arbitration;

(b) conciliation;

(c) judicial settlement including settlement through Lok Adalat: or

(d) mediation.

(2) Were a dispute has been referred--

(a) for arbitration or conciliation, the provisions of the Arbitration and Conciliation Act, 1996 (26 of 1996) shall apply as if the proceedings for arbitration or conciliation were referred for settlement under the provisions of that Act;

(b) to Lok Adalat, the Court shall refer the same to the Lok Adalat in accordance with the provisions of sub-section (1) of section 20 of the Legal Services Authority Act, 1987 (39 of 1987) and all other provisions of that Act shall .apply in respect of the dispute so referred to the Lok Adalat;

(c) for judicial settlement, the Court shall refer the same to a suitable institution or person and such institution or person shall be deemed to be a Lok Adalat and all the provisions of the Legal Services Authority Act, 1987 (39 of 1987) shall apply as if the dispute were referred to a Lok Adalat under the provisions of that Act;

(d) for mediation, the Court shall effect a compromise between the parties and shall follow such procedure as may be prescribed.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-90', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 90 — Power to state case for opinion of Court', '90. Power to state case for opinion of Court
Where any persons agree in writing to state a case for the opinion of the Court, then the Court shall try and determine the same in the manner prescribed.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-91', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 91 — Public nuisances and other wrongful acts affecting the public', '91. Public nuisances and other wrongful acts affecting the public
1 ,2[(1) In the case of a public nuisance or other wrongful act affecting, or likely to affect, the public, a suit for a declaration and injunction or for such other relief as may be appropriate in the circumstances of the case, may be instituted,

(a) by the Advocate-General, or

(b) with the leave of the Court, by two or more persons, even though no special damage has been caused to such persons by reason of such public nuisance or other wrongful act.]

(2) Nothing in this section shall be deemed to limit or otherwise affect any right of suit which may exist independently of its provisions.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-92', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 92 — Public charities', '92. Public charities
1(1) In the case of any alleged breach of any express or constructive trust created for public purposes of a charitable or religious nature, or where the direction of the Court is deemed necessary for the administration of any such trust, the Advocate-General, or two or more persons having an interest in the trust and having obtained the 2 [leave of the Court], may institute a suit, whether contentious or not, in the principal Civil Court of original jurisdiction or in any other Court empowered in that behalf by the State Government within the local limits of whose jurisdiction the whole or any part of the subject-matter of the trust is situate to obtain a decree:

(a) removing any trustee;

(b) appointing a new trustee;

(c) vesting any property in a trustee;

3 [(cc) directing a trustee who has been removed or a person who has ceased to be a trustee, to deliver possession of any trust property in his possession to the person entitled to the possession of such property];

d) directing accounts and inquiries;

(e) declaring what proportion of the trust property or of the interest therein shall be allocated to any particular object of the trust;

(f) authorizing the whole or any part of the trust property to be let, sold, mortgaged or exchanged;

(g) settling a scheme; or

(h) granting such further or other relief as the nature of the case may require.

(2) Save as provided by the Religious Endowments Act, 1863 (XX of 1863), 4 [or by any corresponding law in force in 5 [the territories which, immediately before the 1st November, 1956, were comprised in Part B States]], no suit claiming any of the reliefs specified in sub-section (1) shall be instituted in respect of any such trust as is therein referred to except in conformity with the provisions of that sub-section.

6[(3) The Court may alter the original purposes of an express or constructive trust created for public purposes of a charitable or religious nature and allow the property or income of such trust or any portion thereof to be applied cy pres in one or more of the following circumstances, namely :

(a) where the original purposes of the trust, in whole or in part,

(i) have been, as far as may be, fulfilled; or

(ii) cannot be carried out at all, or cannot be carried out according to the directions given in the instrument creating the trust or, where there is no such instrument, according to the spirit of the trust; or

(b) where the original purposes of the trust provide a use for a part only of the property available by virtue of the trust; or

(c) where the property available by virtue of the trust and other property applicable for similar purposes can be more effectively used in conjunction with, and to that end can suitably be made applicable to any other purpose, regard being had to the spirit of the trust and its applicability to common purposes; or

(d) where the original purposes, in whole or in part, were laid down by reference to an area which then was, but has since ceased to be, a unit for such purposes; or

(e) where the original purposes, in whole or in part, have, since they were laid down,

(i) been adequately provided for by other means, or

(ii) ceased, as being useless or harmful to the community, of

(iii) ceased to be, in law, charitable, or

(iv) ceased in any other way to provide a suitable and effective method of using the property available by virtue of the trust, regard being had to the spirit of the trust.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-93', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 93 — Exercise of powers of Advocate-General outside presidency-towns', '93. Exercise of powers of Advocate-General outside presidency-towns
The powers conferred by
sections 91 and 92 on the Advocate-General may, outside the presidency-towns, be, with the previous
sanction of the State Government, exercised also by the Collector or by such officer as the State
Government may appoint in this behalf.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-94', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 94 — Supplemental proceedings', '94. Supplemental proceedings
In order to prevent the ends of justice from being defeated the Court may, if it is so prescribed,—

(a) issue a warrant to arrest the defendant and bring him before the Court to show cause why he should not give security for his appearance, and if he fails to comply with any order for security commit him to the civil prison;

(b) direct the defendant to furnish security to produce any property belonging to him and to place the same at the disposal of the Court or order the attachment of any property;

(c) grant a temporary injunction and in case of disobedience commit the person guilty thereof to the civil prison and order that his property be attached and sold;

(d) appoint a receiver of any property and enforce the performance of his duties by attaching and selling his property;

(e) make such other interlocutory orders as may appear to the Court to be just and convenient.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-95', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 95 — Compensation for obtaining arrest, attachment or injunction on insufficient ground', '95. Compensation for obtaining arrest, attachment or injunction on insufficient ground
(1) Where, in any suit in which an arrest or attachment has been effected or a temporary injunction granted under the last preceding section,--

(a) it appears to the Court that such arrest, attachment or injunction was applied for on insufficient grounds, or

(b) the suit of the plaintiff fails and it appears to the Court that there was no reasonable or probable grounds for instituting the same,

the defendant may apply to the Court, and the Court may, upon such application, award against the plaintiff by its order such amount 1 [not exceeding fifty thousand rupees], as it deems a reasonable compensation to the defendant for the 2 [expense or injury (including injury to reputation) caused to him]:

Provided that a Court shall not award, under this section, an amount exceeding the limits of its pecuniary jurisdiction.

(2) An order determining any such application shall bar any suit for compensation in respect of such arrest, attachment or injunction.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-96', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 96 — Appeal from original decree', '96. Appeal from original decree
(1) Save where otherwise expressly provided in the body of this Code or by any other law for the time being in force, an appeal shall lie from every decree passed by any Court exercising original jurisdiction to the Court authorized to hear appeals from the decisions of such Court.

(2) An appeal may lie from an original decree passed ex parte.

(3) No appeal shall lie from a decree passed by the Court with the consent of parties.

1[(4) No appeal shall lie, except on a question of law, from a decree in any suit of the nature cognizable by Courts of Small Causes, when the amount or value of the subject-matter of the original suit does not exceed 2 [ten thousand rupees.]]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-97', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 97 — Appeal from final decree where no appeal from preliminary decree', '97. Appeal from final decree where no appeal from preliminary decree
Where any party aggrieved by a preliminary decree passed after the commencement of this Code does not appeal from such decree, he shall be precluded from disputing its correctness in any appeal which may be preferred from the final decree.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-98', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 98 — Decision where appeal heard by two or more Judges', '98. Decision where appeal heard by two or more Judges
(1) Where an appeal is heard by a Bench of two or more Judges, the appeal shall be decided in accordance with the opinion of such Judges or of the majority (if any) of such Judges.

(2) Where there is no such majority which concurs in a judgment varying or reversing the decree appealed from, such decree shall be confirmed:

Provided that where the Bench hearing the appeal is 1[composed of two or other even number of Judges belonging to a Court consisting of more Judges than those constituting the Bench] and the Judges composing the Bench differ in opinion on a point of law, they may state the point of law upon which they differ and the appeal shall then be heard upon that point only by one or more of the other Judges, and such point shall be decided according to the opinion of the majority (if any) of the Judges who have heard the appeal, including those who first heard it.

2[(3) Nothing in this section shall be deemed to alter or otherwise affect any provision of the letters to patent of any High Court.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-99', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 99 — No decree to be reversed or modified for error or irregularity not affecting merits or jurisdiction', '99. No decree to be reversed or modified for error or irregularity not affecting merits or jurisdiction
No decree shall be reversed or substantially varied, nor shall any case be remanded, in appeal on account of any misjoinder 1 [or non-joinder] of parties or causes of action or any error, defect or irregularity in any proceedings in the suit, not affecting the merits of the case or the jurisdiction of the Court :

2[Provided that nothing in this section shall apply to non-joinder of a necessary party.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-99A', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 99A — No order under section 47 to be reversed or modified unless decision of the case is prejudicially affected', '99A. No order under section 47 to be reversed or modified unless decision of the case is prejudicially affected
1[99A. No order under section 47 to be reversed or modified unless decision of the case is prejudicially affected.--Without prejudice to the generality of the provisions of section 99, no order under section 47 shall be reversed or substantially varied, on account of any error, defect or irregularity in any proceeding relating to such order, unless such error, defect or irregularity has prejudicially affected the decision of the case.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-100', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 100 — Second appeal', '100. Second appeal
1[100. Second appeal.--(1) Save as otherwise expressly provided in the body of this Code or by any other law for the time being in force, an appeal shall lie to the High Court from every decree passed in appeal by any Court subordinate to the High Court, if the High Court is satisfied that the case involves a substantial question of law.

(2) An appeal may lie under this section from an appellate decree passed ex parte.

(3) In an appeal under this section, the memorandum of appeal shall precisely state the substantial question of law involved in the appeal.

(4) Where the High Court is satisfied that a substantial question of law is involved in any case, it shall formulate that question.

(5) The appeal shall be heard on the question so formulated and the respondent shall, at the hearing of the appeal, be allowed to argue that the case does not involve such question:

Provided that nothing in this sub-section shall be deemed to take away or abridge the power of the Court to hear, for reasons to be recorded, the appeal on any other substantial question of law, not formulated by it, if it is satisfied that the case involves such question.]

STATE AMENDMENT

Kerala.

In sub-section (1) of section 100 of the Principal Act, after clause (c), the following clause shall be added, namely:

(d) the finding of the lower appellate court on any question of fact material to the right decision of the case on the merits being in conflict with the finding of the Court of first instance on such question.

[Vide Kerala Act 13 of 1957 sec. 4.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/S-100A', 'CPC-1908_2026-06-11', 'CPC-1908', 'section', 'Section 100A — No further appeal in certain cases', '100A. No further appeal in certain cases
1[100A. No further appeal in certain cases.--Notwithstanding anything contained in any Letters Patent for any High Court or in any instrument having the force of law or in any other law for the time being in force, where any appeal from an original or appellate decree or order is heard and decided by a Single Judge of a High Court, no further appeal shall lie from the judgment and decree of such Single Judge.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order I — Parties to Suits', 'ORDER I
PARTIES TO SUITS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 1 — Who may be joined as plaintiffs', 'Rule 1. Who may be joined as plaintiffs
All persons may be joined in one suit as plaintiffs where— 
(a) any right to relief in respect of, or arising out of, the same act or transaction or series of acts or 
transactions is alleged to exist in such persons, whether jointly, severally or in the alternative; and 
(b) if such persons brought separate suits, any common question of law or fact would 
arise.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 2 — Power of Court to order separate trial', 'Rule 2. Power of Court to order separate trial
Where it appears to the Court that any joinder of 
plaintiffs may embarrass or delay the trial of the suit, the Court may put the plaintiffs to the election or 
order separate trials or make such other order as may be expedient.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 3 — Who may be joined as defendants', 'Rule 3. Who may be joined as defendants
All persons may be joined in one suit as defendants 
where—  
(a) any right to relief in respect of, or arising out of, the same act or transaction or series of acts or 
transactions is alleged to exist against such persons, whether jointly, severally or in the alternative; 
and 
(b) if separate suits were brought against such persons, any common question of law or fact 
would arise.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-3A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 3A — Power to order separate trials where joinder of defendants may embarrass or delay 
trial', 'Rule 3A. Power to order separate trials where joinder of defendants may embarrass or delay 
trial
Where it appears to the Court that any joinder of defendants may embarrass or delay the trial of 
the suit, the Court may order separate trials or make such other order as may be expedient in the interests 
of justice.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 4 — Court may give judgment for or against one or more of joint parties', 'Rule 4. Court may give judgment for or against one or more of joint parties
Judgment may be given 
without any amendment — 
(a) for such one or more of the plaintiffs as may be found to be entitled to relief, for such relief 
as he or they may be entitled to; 
(b) against such one or more of the defendants as may be found to be liable, according to their 
respective liabilities.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 5 — Defendant need not be interested in all the relief claimed', 'Rule 5. Defendant need not be interested in all the relief claimed
It shall not be necessary that every 
defendant shall be interested as to all the relief claimed in any suit against him.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 6 — Joinder of parties liable on same contract', 'Rule 6. Joinder of parties liable on same contract
The plaintiff may, at his option, join as parties to 
the same suit all or any of the persons severally, or jointly and severally, liable on any one contract, 
including parties to bills of exchange, hundis and promissory notes.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 7 — When plaintiff in doubt from whom redress is to be sought', 'Rule 7. When plaintiff in doubt from whom redress is to be sought
Where the plaintiff is in doubt as to 
the persons from whom he is entitled to obtain redress, he may join two or more defendants in order that the 
question as to which of the defendants is liable, and to what extent, may be determined as between all 
parties.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 8 — One person may sue or defend on behalf of all in same interest', 'Rule 8. One person may sue or defend on behalf of all in same interest
(1) Where there are 
numerous persons having the same interest in one suit,—  
(a) one or more of such persons may, with the permission of the Court, sue or be sued, or may 
defend such suit, on behalf of, or for the benefit of, all persons so interested; 
(b) the Court may direct that one or more of such persons may sue or be sued, or may defend 
such suit, on behalf of, or for the benefit of, all persons so interested. 
(2) The Court shall, in every case where a permission or direction is given under sub-rule (1), at the 
plaintiff’s expense, give notice of the institution of the suit to all persons so interested, either by personal 
service, or, where, by reason of the number of persons or any other cause, such service is not reasonably 
practicable, by public advertisement, as the Court in each case may direct. 
(3) Any person on whose behalf, or for whose benefit, a suit is instituted, or defended, under                 
sub-rule (1), may apply to the Court to be made a party to such suit. 
(4) No part of the claim in any such suit shall be abandoned under sub-rule (1), and no such suit shall 
be withdrawn under sub-rule (3), of rule 1 of Order XXIII, and no agreement, compromise or satisfaction 
shall be recorded in any such suit under rule 3 of that Order, unless the Court has given, at the plaintiff’s 
expense, notice to all persons so interested in the manner specified in sub-rule (2). 
(5) Where any person suing or defending in any such suit does not proceed with due diligence in the suit 
or defence, the Court may substitute in his place any other person having the same interest in the suit. 
(6) A decree passed in a suit under this rule shall be binding on all persons on whose behalf, or for 
whose benefit, the suit is instituted, or defended, as the case may be. 
Explanation.—For the purpose of determining whether the persons who sue or are sued, or defend, 
have the same interest in one suit, it is not necessary to establish that such persons have the same cause 
of action as the persons on whose behalf, or for whose benefit, they sue or are sued, or defend the suit, as 
the case may be.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-8A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 8A — Power of Court to permit a person or body of persons to present opinion or to take part in the 
proceedings', 'Rule 8A. Power of Court to permit a person or body of persons to present opinion or to take part in the 
proceedings
While trying a suit, the Court may, if satisfied that a person or body of persons is interested in 
any question of law which is directly and substantially in issue in the suit and that it is necessary in the public 
interest to allow that person or body of persons to present his or its opinion on that question of law, permit that 
person or body of persons to present such opinion and to take such part in the proceedings of the suit as the 
Court may specify.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 9 — Misjoinder and non-joinder', 'Rule 9. Misjoinder and non-joinder
No suit shall be defeated by reason of the misjoinder or                      
non-joinder of parties, and the Court may in every suit deal with the matter in controversy so far as 
regards the rights and interests of the parties actually before it: 
3[Provided that nothing in this rule shall apply to non-joinder of a necessary party.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 10 — Suit in name of wrong plaintiff', 'Rule 10. Suit in name of wrong plaintiff
(1) Where a suit has been instituted in the name of the wrong 
person as plaintiff or where it is doubtful whether it has been instituted in the name of the right plaintiff, 
the Court may at any stage of the suit, if satisfied that the suit has been instituted through a bona fide 
mistake, and that it is necessary for the determination of the real matter in dispute so to do, order any 
other person to be substituted or added as plaintiff upon such terms as the Court thinks just. 
(2) Court may strike out or add parties.—The Court may at any stage of the proceedings, either 
upon or without the application of either party, and on such terms as may appear to the Court to be just, 
order that the name of any party improperly joined, whether as plaintiff or defendant, be struck out, and 
that the name of any person who ought to have been joined, whether as plaintiff or defendant, or whose 
 

 
 
 
presence before the Court may be necessary in order to enable the Court effectually and completely to 
adjudicate upon and settle all the questions involved in the suit, be added. 
(3) No person shall be added as a plaintiff suing without a next friend or as the next friend of a 
plaintiff under any disability without his consent. 
(4) Where defendant added, plaint to be amended.—Where a defendant is added, the plaint shall, 
unless the Court otherwise directs, be amended in such manner as may be necessary, and amended copies 
of the summons and of the plaint shall be served on the new defendant and, if the Court thinks fit, on the 
original defendant. 
(5) Subject to the provisions of the 1[Indian Limitation Act, 1877 (XV of 1877)], section 22, the 
proceedings as against any person added as defendant shall be deemed to have begun only on the service 
of the summons.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-10A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 10A — Power of Court to request any pleader to address it', 'Rule 10A. Power of Court to request any pleader to address it
The Court may, in its discretion, 
request any pleader to address it as to any interest which is likely to be affected by its decision on any 
matter in issue in any suit or proceeding, if the party having the interest which is likely to be so affected is 
not represented by any pleader.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 11 — Conduct of suit', 'Rule 11. Conduct of suit
The Court may give the conduct of 3[a suit] to such persons as it deems proper.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 12 — Appearance of one of several plaintiffs or defendants for others', 'Rule 12. Appearance of one of several plaintiffs or defendants for others
(1) Where there are more 
plaintiffs than one, any one or more of them may be authorized by any other of them to appear, plead or 
act for such other in any proceeding; and in like manner, where there are more defendants than one, any 
one or more of them may be authorized by any other of them to appear, plead or act for such other in any 
proceeding. 
(2) The authority shall be in writing signed by the party giving it and shall be filed in Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-I/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-I', 'section', 'Rule 13 — Objections as to non-joinder or misjoinder', 'Rule 13. Objections as to non-joinder or misjoinder
All objections on the ground of non-joinder or 
misjoinder of parties shall be taken at the earliest possible opportunity and, in all cases where issues are 
settled, at or before such settlement, unless the ground of objection has subsequently arisen, and any such 
objection not so taken shall be deemed to have been waived.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-II', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order II — Frame of suit', 'ORDER II
FRAME OF SUIT') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-II/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-II', 'section', 'Rule 1 — Frame of suit', 'Rule 1. Frame of suit
Every suit shall as far as practicable be framed so as to afford ground for final 
decision upon the subjects in dispute and to prevent further litigation concerning them.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-II/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-II', 'section', 'Rule 2 — Suit to include the whole claim', 'Rule 2. Suit to include the whole claim
(1) Every suit shall include the whole of the claim which the 
plaintiff is entitled to make in respect of the cause of action; but a plaintiff may relinquish and portion of 
his claim in order to bring the suit within the jurisdiction of any Court. 
(2) Relinquishment of part of claim.—Where a plaintiff omits to sue in respect of, or intentionally 
relinquishes, any portion of his claim, he shall not afterwards sue in respect of the portion so omitted or 
relinquished. 
(3) Omission to sue for one of several reliefs.—A person entitled to more than one relief in respect 
of the same cause of action may sue for all or any of such reliefs; but if he omits, except with the leave of 
the Court, to sue for all such reliefs, he shall not afterwards sue for any relief so omitted. 
Explanation.—For the purposes of this rule an obligation and a collateral security for its performance 
and successive claims arising under the same obligation shall be deemed respectively to constitute but one 
cause of action. 
 
 
 
 

 
 
 
Illustration 
A lets a house to B at a yearly of rent Rs. 1,200. The rent for the whole of the years 1905, 1906 and 1907 is due and unpaid. 
A sues B in 1908 only for the rent due for 1906. A shall not afterwards sue B for the rent due for 1905 or 1907.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-II/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-II', 'section', 'Rule 3 — Joinder of causes of action', 'Rule 3. Joinder of causes of action
(1) Save as otherwise provided, a plaintiff may unite in the same 
suit several causes of action against the same defendant, or the same defendants jointly; and any plaintiffs 
having causes of action in which they are jointly interested against the same defendant or the same 
defendants jointly may unite such causes of action in the same suit. 
(2) Where causes of action are united, the jurisdiction of the Court as regards the suit shall depend on 
the amount or value of the aggregate subject-matters at the date of instituting the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-II/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-II', 'section', 'Rule 4 — Only certain claims to be joined for recovery of immovable property', 'Rule 4. Only certain claims to be joined for recovery of immovable property
No cause of action 
shall, unless with the leave of the Court, be joined with a suit for the recovery of immovable property, 
except—  
(a) claims for mesne profits or arrears of rent in respect of the property claimed or any part 
thereof; 
(b) claims for damages for breach of any contract under which the property or any part thereof is 
held; and 
(c) claims in which the relief sought is based on the same cause of action: 
Provided that nothing in this rule shall be deemed to prevent any party in a suit for foreclosure or 
redemption from asking to be put into possession of the mortgaged property.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-II/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-II', 'section', 'Rule 5 — Claims by or against executor, administrator or heir', 'Rule 5. Claims by or against executor, administrator or heir
No claim by or against an executor, 
administrator or heir, as such, shall be joined with claims by or against him personally, unless the last 
mentioned claims are alleged to arise with reference to the estate in respect of which the plaintiff or defendant 
sues or is sued as executor, administrator or heir, or are such as he was entitled to, or liable for, jointly with 
the deceased person whom he represents.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-II/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-II', 'section', 'Rule 6 — Power of Court to order separate trials', 'Rule 6. Power of Court to order separate trials
Where it appears to the Court that the joinder of 
causes of action in one suit may embarrass or delay the trial or is otherwise inconvenient, the Court may 
order separate trials or make such other order as may be expedient in the interests of justice.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-II/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-II', 'section', 'Rule 7 — Objections as to misjoinder', 'Rule 7. Objections as to misjoinder
All objections on the ground of misjoinder of causes of action shall 
be taken at the earliest possible opportunity and, in all cases where issues are settled, at or before such 
settlement, unless the ground of objection has subsequently arisen, and any such objection not so taken 
shall be deemed to have been waived. 
 
 
Uttar Pradesh 
Amendment of  the First Schedule Order II.— In the First Schedule to the principal Act 
(hereinafter in this Chapter referred to as the First Schedule), in Order II, in rule 2 — 
(a) the existing explanation shall be numbered as Explanation I, and after Explanation I, 
as so numbered the following explanation II, shall be inserted, namely :— 
“Explanation II— For the purpose of this rule a claim for ejectment of the defendant from 
immovable property let out to him and a claim for money  due  from  him  on account  of  rent  or 
compensation for use and occupation of that property, shall be deemed to be claims in respect 
of distinct causes of action.”; 
(b) for the  illustration,  the  following  illustration  shall  be substituted, namely :— 
“Illustration— A lets immovable property to B at a yearly rent. The rent for the 
whole of the years 1905, 1906 and 1907 is due and unpaid, and the tenancy  is  
determined before A sues Bin 1908, only for the  rent due for 1906. A may afterwards  
sue B for ejectment but not for the rent due for 1905 or 1907.” 
[Vide Uttar Pradesh Act 57 of 1976, s. 4]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-III', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order III — Recognized Agents and Pleaders', 'ORDER III
RECOGNIZED AGENTS AND PLEADERS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-III/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-III', 'section', 'Rule 1 — Appearances, etc., may be in person, by recognized agent or by pleader', 'Rule 1. Appearances, etc., may be in person, by recognized agent or by pleader
Any appearance, 
application or act in or to any Court, required or authorized by law to be made or done by a party in such Court, 
may, except where otherwise expressly provided by any law for the time being in force, be made or done by the 
party in person, or by his recognized agent, or by a pleader 1[appearing, applying or acting, as the case may be,] 
on his behalf: 
Provided that any such appearance shall, if the Court so directs, be made by the party in person.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-III/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-III', 'section', 'Rule 2 — Recognized agents', 'Rule 2. Recognized agents
The recognized agents of parties by whom such appearances, applications 
and acts may be made or done are—  
(a) persons holding powers-of-attorney, authorising them to make and do such appearances, 
applications and acts on behalf of such parties; 
(b) persons carrying on trade or business for and in the names of parties not resident within the 
local limits of the jurisdiction of the Court within which limits the appearance, application or act is 
made or done, in matters connected with such trade or business only, where no other agent is 
expressly authorised to make and do such appearances, applications and acts.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-III/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-III', 'section', 'Rule 3 — Service of process on recognized agent', 'Rule 3. Service of process on recognized agent
(1) Processes served on the recognised agent of a party 
shall be as effectual as if the same had been served on the party in person, unless the Court otherwise 
directs. 
(2) The provisions for the service of process on a party to a suit shall apply to the service of process 
on his recognised agent.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-III/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-III', 'section', 'Rule 4 — Appointment of pleader', 'Rule 4. Appointment of pleader
(1) No pleader shall act for any person in any Court, unless he has been 
appointed for the purpose by such person by a document in writing signed by such person or by his recognized 
agent or by some other person duly authorised by or under a power-of-attorney to make such appointment. 
(2) Every such appointment shall be 3[filed in Court and shall, for the purposes of sub-rule (1), be] 
deemed to be in force until determined with the leave of the Court by a writing signed by the client or the 
pleader, as the case may be, and filed in Court, or until the client or the pleader dies, or until all 
proceedings in the suit are ended so far as regards the client. 
4[Explanation.—For the purposes of this sub-rule, the following shall be deemed to be proceedings in 
the suit,—  
(a) an application for the review of decree or order in the suit, 
(b) an application under section 144 or under section 152 of this Code, in relation to any decree or 
order made in the suit, 
(c) an appeal from any decree or order in the suit, and 
(d) any application or act for the purpose of obtaining copies of documents or return of 
documents produced or filed in the suit or of obtaining refund of moneys paid into the Court in 
connection with the suit.] 
5[(3) Nothing in sub-rule (2) shall be construed—  
(a) as extending, as between the pleader and his client, the duration for which the pleader is 
engaged, or 
 

 
 
 
(b) as authorising service on the pleader of any notice or document issued by any Court other than 
the Court for which the pleader was engaged, except where such service was expressly agreed to by 
the client in the document referred to in sub-rule (1).] 
(4) The High Court may, by general order, direct that, where the person by whom a pleader is appointed is 
unable to write his name, his mark upon the document appointing the pleader shall be attested by such 
person and in such manner as may be specified by the order. 
(5) No pleader who has been engaged for the purpose of pleading only shall plead on behalf of any 
party, unless he has filed in Court a memorandum of appearance signed by himself and stating—  
(a) the names of the parties to the suit, 
(b) the name of the party for whom he appears, and 
(c) the name of the person by whom he is authorised to appear: 
Provided that nothing in this sub-rule shall apply to any pleader engaged to plead on behalf of any 
party by any other pleader who has been duly appointed to act in Court on behalf of such party.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-III/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-III', 'section', 'Rule 5 — Service of process on pleader', 'Rule 5. Service of process on pleader
1[Any process served on the pleader who has been duly 
appointed to act in Court for any party] or left at the office or ordinary residence of such pleader, and 
whether the same is for the personal appearance of the party or not, shall be presumed to be duly 
communicated and made known to the party whom the pleader represents, and, unless the Court 
otherwise directs, shall be as effectual for all purposes as if the same had been given to or served on the 
party in person.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-III/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-III', 'section', 'Rule 6 — Agent to accept service', 'Rule 6. Agent to accept service
(1) Besides the recognised agents described in rule 2 any person 
residing within the jurisdiction of the Court may be appointed an agent to accept service of process. 
(2) Appointment to be in writing and to be filed in Court.—Such appointment may be special or 
general and shall be made by an instrument in writing signed by the principal, and such instrument or, if 
the appointment is general, a certified copy thereof shall be filed in Court. 
2[(3) The Court may, at any stage of the suit, order any party to the suit not having a recognised agent 
residing within the jurisdiction of the Court, or a pleader who has been duly appointed to act in the Court 
on his behalf, to appoint, within a specified time, an agent residing within the jurisdiction of the Court to 
accept service of the process on his behalf.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IV', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order IV — Institution of suits', 'ORDER IV
INSTITUTION OF SUITS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IV/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IV', 'section', 'Rule 1 — Suit to be commenced by plaint', 'Rule 1. Suit to be commenced by plaint
(1) Every suit shall be instituted by presenting 3[plaint in 
duplicate to the Court] or such officer as it appoints in this behalf. 
(2) Every plaint shall comply with the rules contained in Orders VI and VII, so far as they are 
applicable. 
4[(3) The plaint shall not be deemed to be duly instituted unless it complies with the requirements 
specified in sub-rules (1) and (2).]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IV/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IV', 'section', 'Rule 2 — Register of suits', 'Rule 2. Register of suits
The Court shall cause the particulars of every suit to be entered in a book to be 
kept for the purpose and called the register of civil suits. Such entries shall be numbered in every year 
according to the order in which the plaints are admitted. 
 
 
 

 
 
 
Uttar Pradesh 
 
Insertion of      Order IV-A.—In the First Schedule, after Order IV, the following  Order shall be 
inserted, namely :— 
“ORDER  IV-A 
CONSOLIDATION OF CASES') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order V — Issue and service of summons', 'ORDER V
ISSUE AND SERVICE OF SUMMONS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 1 — Summons', 'Rule 1. Summons
1[(1) When a suit has been duly instituted, a summons may be issued to the defendant 
to appear and answer the claim and to file the written statement of his defence, if any, within thirty days 
from the date of service of summons on that defendant: 
Provided that no such summons shall be issued when a defendant has appeared at the presentation of 
plaint and admitted the plaintiff’s claim: 
*[Provided further that where the defendant fails to file the written statement within the said period of 
thirty days, he shall be allowed to file the same on such other day as may be specified by the Court, for 
reasons to be recorded in writing but which shall not be later than ninety days from the date of service of 
summons.] 
(2) A defendant to whom a summons has been issued under sub-rule (1) may appear—  
(a) in person, or 
(b) by a pleader duly instructed and able to answer all material questions relating to the suit, or 
(c) by a pleader accompanied by some person able to answer all such questions. 
(3) Every such summons shall be signed by the Judge or such officer as he appoints, and shall be 
sealed with the seal of the Court. 
Jammu and Kashmir and Ladakh (UTs).— 
In Order V, in Rule 1, for the second proviso, substitute the following proviso, namely;- 
Provided further that where the defendant fails to file the written statement within the said period of 
thirty days, he shall be allowed to file the written statement on such other day, as may be specified by the 
court, for reasons to be recorded in writing and on payment of such costs as the court deems fit, but which 
shall not be later than one hundred twenty days from the date of service of summons and on expiry of one 
 
* Subs. by Act 4 of 2016, s. 16 and Sch., for the Second Proviso, Shall be applicable to commercial disputes of a specified value 
(w.e.f. 23-10-2015). 

 
 
 
hundred twenty days from the date of service of summons, the defendant shall forfeit the right to file the 
written statement and the court shall not allow the written statement to be taken on record. 
[Vide the Jammu and Kashmir Reorganisation (Adaptation of Central Laws) Order, 2020, notification 
No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation (Adaptation of 
Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020)].') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 2 — Copy of plaint annexed to summons', 'Rule 2. Copy of plaint annexed to summons
Every summon shall be accompanied by a copy of the 
plaint.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 3 — Court may order defendant or plaintiff to appear in person', 'Rule 3. Court may order defendant or plaintiff to appear in person
(1) Where the court sees reason to 
require the personal appearance of the defendant, the summons shall order him to appear in person in 
Court on the day therein specified. 
(2) Where the Court sees reason to require the personal appearance of the plaintiff on the same day, it 
shall make an order for such appearance.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 4 — No party to be ordered to appear in person unless resident within certain limits', 'Rule 4. No party to be ordered to appear in person unless resident within certain limits
No party 
shall be ordered to appear in person unless he resides—  
(a) within the local limits of the Court’s ordinary original jurisdiction, or 
(b) without such limits but at place less than fifty or (where there is railway or steamer 
communication or other established public conveyance for five-sixths of the distance between the 
place where he resides and the place where the Court is situate) less than two hundred miles distance 
from the court-house.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 5 — Summons to be either to settle issues or for final disposal', 'Rule 5. Summons to be either to settle issues or for final disposal
The Court shall determine, at the 
time of issuing the summons, whether it shall be for the settlement of issues only, or for the final disposal 
of the suit; and the summons shall contain a direction accordingly: 
Provided that, in every suit heard by a Court of Small Causes, the summons shall be for the final 
disposal of the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 6 — Fixing day for appearance of defendant', 'Rule 6. Fixing day for appearance of defendant
The day 2[under sub-rule (1) of rule 1] shall be fixed 
with reference to the current business of the Court, the place of residence of the defendant and the time 
necessary for the service of the summons; and the day shall be so fixed as to allow the defendant 
sufficient time to enable him to appear and answer on such day.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 7 — Summons to order defendant to produce documents relied on by him', 'Rule 7. Summons to order defendant to produce documents relied on by him
The summons to 
appear and answer shall order the defendant to produce 3[all documents or copies thereof specified in 
rule l A of Order VIII] in his possession or power upon which he intends to rely in support of his case.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 8 — On issue of summons for final disposal, defendant to be directed to produce his witnesses', 'Rule 8. On issue of summons for final disposal, defendant to be directed to produce his witnesses
Where 
the summons is for the final disposal of the suit, it shall also direct the defendant to produce, on the day fixed 
for his appearance, all witnesses upon whose evidence he intends to rely in support of his case. 
Service of summons') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 9 — Delivery of summons by Court', 'Rule 9. Delivery of summons by Court
(1) Where the defendant resides within the jurisdiction of the 
Court in which the suit is instituted, or has an agent resident within that jurisdiction who is empowered to 
accept the service of the summons, the summons shall, unless the Court otherwise directs, be delivered or sent 
either to the proper officer to be served by him or one of his subordinates or to such courier services as are 
approved by the Court. 
 (2) The proper officer may be an officer of a Court other than that in which the suit is instituted, and, where 
he is such an officer, the summons may be sent to him in such manner as the Court may direct. 
(3) The services of summons may be made by delivering or transmitting a copy thereof by 5[speed post 
with registration and proof of delivery addressed to the defendant or his agent empowered to accept the 
service] or by such courier services as are approved by the High Court or by the Court referred to in             
 

 
 
 
sub-rule (1) or by any other means of transmission of documents (including fax message or electronic mail 
service) provided by the rules made by the High Court: 
Provided that the service of summons under this sub-rule shall be made at the expenses of the plaintiff. 
(4) Notwithstanding anything contained in sub-rule (1), where a defendant resides outside the jurisdiction 
of the Court in which the suit is instituted, and the Court directs that the service of summons on that defendant 
may be made by such mode of service of summons as is referred to in sub-rule (3) 1***, the provisions of       
rule 21 shall not apply. 
(5) When an acknowledgment or any other receipt purporting to be signed by the defendant or his agent is 
received by the Court or postal article containing the summons is received back by the Court with an 
endorsement purporting to have been made by a postal employee or by any person authorised by the courier 
service to the effect that the defendant or his agent had refused to take delivery of the postal article containing 
the summons or had refused to accept the summons by any other means specified in sub-rule (3) when 
tendered or transmitted to him, the Court issuing the summons shall declare that the summons had been duly 
served on the defendant: 
Provided that where the summons was properly addressed, pre-paid and duly sent by 2[speed post with 
registration and proof of delivery, the declaration referred to in this sub-rule shall be made notwithstanding the 
fact that the proof of delivery] having been lost or mislaid, or for any other reason, has not been received by 
the Court within thirty days from the date of issue of summons. 
(6) The High Court or the District Judge, as the case may be, shall prepare a panel of courier agencies for 
the purposes of sub-rule (1).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-9A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 9A — Summons given to the plaintiff for service', 'Rule 9A. Summons given to the plaintiff for service
(1) The Court may, in addition to the service of 
summons under rule 9, on the application of the plaintiff for the issue of a summons for the appearance of the 
defendant, permit such plaintiff to effect service of such summons on such defendant and shall, in such a case, 
deliver the summons to such plaintiff for service. 
(2) The service of such summons shall be effected by or on behalf of such plaintiff by delivering or 
tendering to the defendant personally a copy thereof signed by the Judge or such officer of the Court as he may 
appoint in this behalf and sealed with the seal of the Court or by such mode of service as is referred to in                  
sub-rule (3) of rule 9. 
(3) The provisions of rules 16 and 18 shall apply to a summons personally served under this rule as if the 
person effecting service were a serving officer. 
(4) If such summons, when tendered, is refused or if the person served refuses to sign an acknowledgment of 
service or for any reason such summons cannot be served personally, the Court shall, on the application of the party, 
re-issue such summons to be served by the Court in the same manner as a summons to a defendant.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 10 — Mode of service', 'Rule 10. Mode of service
Service of the summons shall be made by delivering or tendering a copy thereof signed 
by the Judge or such officer as he appoints in this behalf, and sealed with the seal of the Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 11 — Service on several defendants', 'Rule 11. Service on several defendants
Save as otherwise prescribed, where there are more defendants 
than one, service of the summons shall be made on each defendant.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 12 — Service to be on defendant in person when practicable, or on his agent', 'Rule 12. Service to be on defendant in person when practicable, or on his agent
Wherever it is 
practicable, service shall be made on the defendant in person, unless he has an agent empowered to accept 
service, in which case service on such agent shall be sufficient.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 13 — Service on agent by whom defendant carries on business', 'Rule 13. Service on agent by whom defendant carries on business
(1) In a suit relating to any 
business or work against a person who does not reside within the local limits of the jurisdiction of the 
Court from which the summons is issued, service on any manager or agent, who, at the time of service, 
personally carries on such business or work for such person within such limits, shall be deemed good 
service. 
(2) For the purpose of this rule the master of a ship shall be deemed to be the agent of the owner or 
charterer.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-14', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 14 — Service on agent in charge in suits for immovable property', 'Rule 14. Service on agent in charge in suits for immovable property
Where in a suit to obtain relief 
respecting, or compensation for wrong to, immovable property, service cannot be made on the defendant 
 

 
 
 
in person, and the defendant has no agent empowered to accept the service, it may be made on any agent 
of the defendant in charge of the property.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-15', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 15 — Where service may be on an adult member of defendant’s family', 'Rule 15. Where service may be on an adult member of defendant’s family
Where in any suit the 
defendant is absent from his residence at the time when the service of summons is sought to be effected 
on his at his residence and there is no likelihood of his being found at the residence within a reasonable 
time and he has no agent empowered to accept service of the summons on his behalf, service may be 
made on any adult member of the family, whether male or female, who is residing with him. 
Explanation.—A servant is not a member of the family within the meaning of this rule.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-16', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 16 — Person served to sign acknowledgment', 'Rule 16. Person served to sign acknowledgment
Where the serving officer delivers or tenders a copy 
of the summons to the defendant personally, or to an agent or other person on his behalf, he shall require 
the signature of the person to whom the copy is so delivered or tendered to an acknowledgment of service 
endorsed on the original summons.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-17', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 17 — Procedure when defendant refuses to accept service, or cannot be found', 'Rule 17. Procedure when defendant refuses to accept service, or cannot be found
Where the 
defendant or his agent or such other person as aforesaid refuses to sign the acknowledgment, or where the 
serving officer, after using all due and reasonable diligence, cannot find the defendant, 2[who is absent 
from his residence at the time when service is sought to be effected on him at his residence and there is no 
likelihood of his being found at the residence within a reasonable time], and there is no agent empowered 
to accept service of the summons on his behalf, nor any other person on whom service can be made, the 
serving officer shall affix a copy of the summons on the outer door or some other conspicuous part of the 
house in which the defendant ordinarily resides or carries on business or personally works for gain, and 
shall then return the original to the Court from which it was issued, with a report endorsed thereon or 
annexed thereto stating that he has so affixed the copy, the circumstances under which he did so, and the 
name and address of the person (if any) by whom the house was identified and in whose presence the 
copy was affixed.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-18', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 18 — Endorsement of time and manner of service', 'Rule 18. Endorsement of time and manner of service
The serving officer shall, in all cases in which 
the summons has been served under rule 16, endorse or annex, or cause to be endorsed or annexed, on or 
to the original summons, a return stating the time when and the manner in which the summons was 
served, and the name and address of the person (if any) identifying the person served and witnessing the 
delivery or tender of the summons.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-19', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 19 — Examination of serving officer', 'Rule 19. Examination of serving officer
Where a summons is returned under rule 17, the Court shall, if the 
return under that rule has not been verified by the affidavit of the serving officer, and may, if it has been so 
verified, examine the serving officer on oath, or cause him to be so examined by another Court, touching his 
proceedings, and may make such further enquiry in the matter as it thinks fit; and shall either declare that 
the summons has been duly served or order such service as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-19A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 19A — [Simultaneous issue of summons for service by post in addition to personal service.] Omitted by 
the Code of Civil Procedure (Amendment) Act, 1999 (46 of 1999), s', 'Rule 19A. [Simultaneous issue of summons for service by post in addition to personal service.] Omitted by 
the Code of Civil Procedure (Amendment) Act, 1999 (46 of 1999), s
15 (w.e.f. 1-7-2002).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-20', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 20 — Substituted service', 'Rule 20. Substituted service
(1) Where the Court is satisfied that there is reason to believe that the 
defendant is keeping out of the way for the purpose of avoiding service, or that for any other reason the 
summons cannot be served in the ordinary way, the Court shall order the summons to be served by 
affixing a copy thereof in some conspicuous place in the Court-house, and also upon some conspicuous 
part of the house (if any) in which the defendant is known to have last resided or carried on business or 
personally worked for gain, or in such other manner as the Court thinks fit. 
3[(1A) Where the Court acting under sub-rule (1) orders service by an advertisement in a newspaper, 
the newspaper shall be a daily newspaper circulating in the locality in which the defendant is last known 
to have actually and voluntarily resided, carried on business or personally worked for gain.] 
(2) Effect of substituted service.—Service substituted by order of the Court shall be as effectual as if 
it had been made on the defendant personally. 
 

 
 
 
(3) Where service substituted, time for appearance to be fixed.—Where service is substituted by 
order of the Court, the Court shall fix such time for the appearance of the defendant as the case may 
require.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-20A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 20A — Service of summons by post.] Rep. by the Code of Civil Procedure (Amendment) Act, 1976 
(104 of 1976), s', 'Rule 20A. Service of summons by post.] Rep. by the Code of Civil Procedure (Amendment) Act, 1976 
(104 of 1976), s
55 (w.e.f. 1-2-1977)].') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-21', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 21 — Service of summons where defendant resides within jurisdiction of another Court', 'Rule 21. Service of summons where defendant resides within jurisdiction of another Court
A 
summons may be sent by the Court by which it is issued, whether within or without the State, either by 
one of its officers 2[or by post or by such courier service as may be approved by the High Court, by fax 
message or by Electronic Mail service or by any other means as may be provided by the rules made by 
the High Court] to any Court (not being the High Court) having jurisdiction in the place where the 
defendant resides.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-22', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 22 — Service within presidency-towns of summons issued by Courts outside', 'Rule 22. Service within presidency-towns of summons issued by Courts outside
Where a summons 
issued by any Court established beyond the limits of the towns of Calcutta, Madras 3[and Bombay] is to 
be served within any such limits, it shall be sent to the Court of Small Causes within whose jurisdiction it 
is to be served.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-23', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 23 — Duty of Court to which summons is sent', 'Rule 23. Duty of Court to which summons is sent
The Court to which a summons is sent under rule 21 or 
rule 22 shall, upon receipt thereof, proceed as if it had been issued by such Court and shall then return the 
summons to the Court of issue, together with the record (if any) of its proceedings with regard thereto.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-24', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 24 — Service on defendant in prison', 'Rule 24. Service on defendant in prison
Where the defendant is confined in a prison, the summons 
shall be delivered or sent 2[or by post or by such courier service as may be approved by the High Court, 
by fax message or by Electronic Mail service or by any other means as may be provided by the rules 
made by the High Court] to the officer in charge of the prison for service on the defendant.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-25', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 25 — Service where defendant resides out of India and has no agent', 'Rule 25. Service where defendant resides out of India and has no agent
Where the defendant resides 
out of 4[India] and has no agent in 4[India] empowered to accept service, the summons shall be addressed 
to the defendant at the place where he is residing and sent to him 2[or by post or by such courier service as 
may be approved by the High Court, by fax message or by Electronic Mail service or by any other means 
as may be provided by the rules made by the High Court], if there is postal communication between such 
place and the place where the Court is situate: 
5[Provided that where any such defendant 6[resides in Bangladesh or Pakistan], the summons, 
together with a copy thereof, may be sent for service on the defendant, to any Court in that country (not 
being the High Court) having jurisdiction in the place where the defendant resides: 
Provided further that where any such defendant is a public officer 7[in Bangladesh or Pakistan (not 
belonging to the Bangladesh or, as the case may be, Pakistan military, naval or air forces)] or is a servant 
of a railway company or local authority in that country, the summons, together with a copy thereof, may 
be sent for service on the defendant, to such officer or authority in that country as the Central Government 
may, by notification in the Official Gazette, specify in this behalf.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-26', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 26 — Service in foreign territory through Political Agent or Court', 'Rule 26. Service in foreign territory through Political Agent or Court
Where—  
(a) in the exercise of any foreign jurisdiction vested in the Central Government, a Political Agent 
has been appointed, or a Court has been established or continued, with power to serve a summons, 
issued by a Court under this Code, in any foreign territory in which the defendant actually and 
voluntarily resides, carries on business or personally works for gain, or 
 

 
 
 
(b) the Central Government has, by notification in the Official Gazette, declared in respect of 
any Court situate in any such territory and not established or continued in the exercise of any such 
jurisdiction as aforesaid, that service by such Court of any summons issued by a Court under this 
Code shall be deemed to be valid service, 
the summons may be sent to such Political Agent or Court, by post, or otherwise, or if so directed by the 
Central Government, through the Ministry of that Government dealing with foreign affairs, or in such 
other manner as may be specified by the Central Government for the purpose of being served upon the 
defendant; and, if the Political Agent or Court returns the summons with an endorsement purporting to 
have been made by such Political Agent or by the Judge or other officer of the Court to the effect that the 
summons has been served on the defendant in the manner hereinbefore directed, such endorsement shall 
be deemed to be evidence of service.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-26A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 26A — Summonses to be sent to officers to foreign countries', 'Rule 26A. Summonses to be sent to officers to foreign countries
Where the Central Government has, by 
notification in the Official Gazette, declared in respect of any foreign territory that summonses to be served 
on defendants actually and voluntarily residing or carrying on business or personally working for gain in that 
foreign territory may be sent to an officer of the Government of the foreign territory specified by the Central 
Government, the summonses may be sent to such officer, through the Ministry of the Government of India 
dealing with foreign affairs or in such other manner as may be specified by the Central Government; and if 
such officer returns any such summons with an endorsement purporting to have been made by him that the 
summons has been served on the defendant, such endorsement shall be deemed to be evidence of service.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-27', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 27 — Service on civil public officer or on servant of railway company or local authority', 'Rule 27. Service on civil public officer or on servant of railway company or local authority
Where 
the defendant is a public officer (not belonging to the 1[the Indians] military 2[naval or air] forces 3***), 
or is the servant of a railway company or local authority, the Court may, if it appears to it that the 
summons may be most conveniently so served, send it for service on the defendant to the head of the 
office in which he is employed, together with a copy to be retained by the defendant.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-28', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 28 — Service on soldiers, sailors or airmen', 'Rule 28. Service on soldiers, sailors or airmen
Where the defendant is a soldier, 4[sailor] 5[or airman], 
the Court shall send the summons for service to his commanding officer together with a copy to be 
retained by the defendant.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-29', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 29 — Duty of person to whom summons is delivered or sent for service', 'Rule 29. Duty of person to whom summons is delivered or sent for service
(1) Where a summons is 
delivered or sent to any person for service under rule 24, rule 27 or rule 28, such person shall be bound to 
serve it if possible, and to return it under his signature, with the written acknowledgment of the defendant, 
and such signature shall be deemed to be evidence of service. 
(2) Where from any cause service is impossible, the summons shall be returned to the Court with a 
full statement of such cause and of the steps taken to procure service, and such statement shall be deemed 
to be evidence of non-service.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-V/R-30', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-V', 'section', 'Rule 30 — Substitution of letter for summons', 'Rule 30. Substitution of letter for summons
(1) The Court may, notwithstanding anything hereinbefore 
contained, substitute for a summons a letter signed by the Judge or such officer as he may appoint in this behalf, 
where the defendant is, in the opinion of the Court, of a rank entitling him to such mark of consideration. 
(2) A letter substituted under sub-rule (1) shall contain all the particulars required to be stated in a 
summons, and, subject to the provisions of sub-rule (3), shall be treated in all respects as a summons. 
(3) A letter so substituted may be sent to the defendant by post or by a special messenger selected by 
the Court, or in any other manner which the Court thinks fit; and, where the defendant has an agent 
empowered to accept service, the letter may be delivered or sent to such agent.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order VI — Pleadings generally', 'ORDER VI
PLEADINGS GENERALLY') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 1 — Pleading', 'Rule 1. Pleading
“Pleading” shall mean plaint or written statement.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 2 — Pleading to state material facts and not evidence', 'Rule 2. Pleading to state material facts and not evidence
(1) Every pleading shall contain, and 
contain only, a statement in a concise form of the material facts on which the party pleading relies for his 
claim or defence, as the case may be, but not the evidence by which they are to be proved. 
(2) Every pleading shall, when necessary, be divided into paragraphs, numbered consecutively, each 
allegation being, so far as is convenient, contained in a separate paragraph. 
(3) Dates, sums and numbers shall be expressed in a pleading in figures as well as in words.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 3 — Forms of pleading', 'Rule 3. Forms of pleading
The forms in Appendix A when applicable, and where they are not 
applicable forms of the like character, as nearly as may be, shall be used for all pleadings. 
*[3A. Forms of pleading in Commercial Courts.––In a commercial dispute, where forms of 
pleadings have been prescribed under the High Court Rules or Practice Directions made for the purposes 
of such commercial disputes, pleadings shall be in such forms.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 4 — Particulars to be given where necessary', 'Rule 4. Particulars to be given where necessary
In all cases in which the party pleading relies on any 
misrepresentation, fraud, breach of trust, wilful default, or undue influence, and in all other cases in which 
particulars may be necessary beyond such as are exemplified in the forms aforesaid, particulars (with 
dates and items if necessary) shall be stated in the pleading.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 5 — [Further and better statement, or particulars.] Omitted by the Code of Civil Procedure 
(Amendment) Act, 1999 (46 of 1999), s', 'Rule 5. [Further and better statement, or particulars.] Omitted by the Code of Civil Procedure 
(Amendment) Act, 1999 (46 of 1999), s
16 (w.e.f. 1-7-2002).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 6 — Condition precedent', 'Rule 6. Condition precedent
Any condition precedent, the performance or occurrence of which is intended 
to be contested, shall be distinctly specified in his pleading by the plaintiff or defendant, as the case may be; 
and, subject thereto, an averment of the performance or occurrence of all conditions precedent necessary for 
the case of the plaintiff or defendant shall be implied in his pleading.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 7 — Departure', 'Rule 7. Departure
No pleading shall, except by way of amendment, raise any new ground of claim or 
contain any allegation of fact inconsistent with the previous pleadings of the party pleading the same.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 8 — Denial of contract', 'Rule 8. Denial of contract
Where a contract is alleged in any pleading, a bare denial of the same by the 
opposite party shall be construed only as a denial in fact of the express contract alleged or of the matters of fact 
from which the same may be implied, and not as a denial of the legality or sufficiency in law of such contract.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 9 — Effect of document to be stated', 'Rule 9. Effect of document to be stated
Wherever the contents of any document are material, it shall be 
sufficient in any pleading to state the effect thereof as briefly as possible, without setting out the whole or 
any part thereof, unless the precise words of the document or any part thereof are material.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 10 — Malice, knowledge, etc', 'Rule 10. Malice, knowledge, etc
Wherever it is material to allege malice, fradulent intention, knowledge 
or other condition of the mind of any person, it shall be sufficient to allege the same as a fact without 
setting out the circumstances from which the same is to be inferred.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 11 — Notice', 'Rule 11. Notice
Wherever it is material to allege notice to any person of any fact, matter or thing, it shall 
be sufficient to allege such notice as a fact, unless the form or the precise terms of such notice, or the 
circumstances from which such notice is to be inferred, are material.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 12 — Implied contract, or relation', 'Rule 12. Implied contract, or relation
Whenever any contract or any relation between any persons is to 
be implied from a series of letters or conversations or otherwise from a number of circumstances, it shall 
be sufficient to allege such contract or relation as a fact, and to refer generally to such letters, 
conversations or circumstances without setting them out in detail. And if in such case the person so 
pleading desires to rely in the alternative upon more contracts or relations than one as to be implied from 
such circumstances, he may state the same in the alternative. 
 
* Ins. by Act 4 of 2016, s. 16 and Sch., Shall be applicable to commercial disputes of a specified value (w.e.f. 23-10-2015).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 13 — Presumptions of law', 'Rule 13. Presumptions of law
Neither party need in any pleading allege any matter of fact which the 
law presumes in his favour or as to which the burden of proof lies upon the other side unless the same has 
first been specifically denied (e.g., consideration for a bill of exchange where the plaintiff sues only on 
the bill and not for the consideration as a substantive ground of claim).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-14', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 14 — Pleading to be signed', 'Rule 14. Pleading to be signed
Every pleading shall be signed by the party and his pleader (if any):  
Provided that where a party pleading is, by reason of absence or for other good cause, unable to sign 
the pleading, it may be signed by any person duly authorized by him to sign the same or to sue or defend 
on his behalf.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-14A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 14A — Address for service of notice', 'Rule 14A. Address for service of notice
(1) Every pleading, when filed by a party, shall be accompanied 
by a statement in the prescribed form, signed as provided in rule 14, regarding the address of the party. 
(2) Such address may, from time to time, be changed by lodging in Court a form duly filled up and 
stating the new address of the party and accompanied by a verified petition. 
(3) The address furnished in the statement made under sub-rule (1) shall be called the “registered 
address” of the party, and shall, until duly changed as aforesaid, be deemed to be the address of the party 
for the purpose of service of all processes in the suit or in any appeal from any decree or order therein 
made and for the purpose of execution, and shall hold good, subject as aforesaid, for a period of two years 
after the final determination of the cause or matter. 
(4) Service of any process may be effected upon a party at his registered address in all respects as 
though such party resided thereat. 
(5) Where the registered address of a party is discovered by the Court to be incomplete, false or 
fictitious, the Court may, either on its own motion, or on the application of any party, order—  
(a) in the case where such registered address was furnished by a plaintiff, stay of the suit, or 
(b) in the case where such registered address was furnished by a defendant, his defence be 
struck out and he be placed in the same position as if he had not put up any defence. 
(6) Where a suit is stayed or a defence is struck out under sub-rule (5), the plaintiff or, as the case may be, 
the defendant may, after furnishing his true address, apply to the Court for an order to set aside the order of 
stay or, as the case may be, the order striking out the defence. 
(7) The Court, if satisfied that the party was prevented by any sufficient cause from filing the true address 
at the proper time, shall set aside the order of stay or order striking out the defence, on such terms as to costs or 
otherwise as it thinks fit and shall appoint a day for proceeding with the suit or defence, as the case may be. 
(8) Nothing in this rule shall prevent the Court from directing the service of a process at any other address, 
if, for any reason, it thinks fit to do so.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-15', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 15 — Verification of pleadings', 'Rule 15. Verification of pleadings
(1) Save as otherwise provided by any law for the time being in force, 
every pleading shall be verified at the foot by the party or by one of the parties pleading or by some other 
person proved to the satisfaction of the Court to be acquainted with the facts of the case. 
(2) The person verifying shall specify, by reference to the numbered paragraphs of the pleading, what he 
verifies of his own knowledge and what he verifies upon information received and believed to be true. 
(3) The verification shall be signed by the person making it and shall state the date on which and the place 
at which it was signed. 
 
 

 
 
 
1[(4) The person verifying the pleading shall also furnish an affidavit in support of his pleadings. 
*[15A. Verification of pleadings in a commercial dispute.—(1) Notwithstanding anything contained in 
rule 15, every pleading in a commercial dispute shall be verified by an affidavit in the manner and form 
prescribed in the Appendix to this Schedule.  
(2) An affidavit under sub-rule (1) above shall be signed by the party or by one of the parties to the 
proceedings, or by any other person on behalf of such party or parties who is proved to the satisfaction of the 
Court to be acquainted with the facts of the case and who is duly authorised by such party or parties. 
(3) Where a pleading is amended, the amendments must be verified in the form and manner referred to in 
sub-rule (1) unless the Court orders otherwise.  
(4) Where a pleading is not verified in the manner provided under sub-rule (1), the party shall not be 
permitted to rely on such pleading as evidence or any of the matters set out therein.  
(5) The Court may strike out a pleading which is not verified by a Statement of Truth, namely, the 
affidavit set out in the Appendix to this Schedule.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-16', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 16 — Striking out pleadings', 'Rule 16. Striking out pleadings
The Court may at any stage of the proceedings order to be struck out or 
amended any matter in any pleading—  
(a) which may be unnecessary, scandalous, frivolous or vexatious, of 
(b) which may tend to prejudice, embarrass or delay the fair trail of the suit, or 
(c) which is otherwise an abuse of the process of the Court.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-17', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 17 — Amendment of pleadings', 'Rule 17. Amendment of pleadings
The Court may at any stage of the proceedings allow either party to 
alter or amend his pleadings in such manner and on such terms as may be just, and all such amendments shall 
be made as may be necessary for the purpose of determining the real questions in controversy between the 
parties: 
Provided that no application for amendment shall be allowed after the trial has commenced, unless the 
Court comes to the conclusion that in spite of due diligence, the party could not have raised the matter before 
the commencement of trial.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VI/R-18', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VI', 'section', 'Rule 18 — Failure to amend after Order', 'Rule 18. Failure to amend after Order
If a party who has obtained an order for leave to amend does not 
amend accordingly within the time limited for that purpose by the order, or if no time is thereby limited then 
within fourteen days from the date of the order, he shall not be permitted to amend after the expiration of such 
limited time as aforesaid or of such fourteen days, as the case may be, unless the time is extended by the 
Court.] 
Uttar Pradesh 
Amendment of Order VI of the First  Schedule.— In the First Schedule to  the  said  
Code,  in  Order  VI,  in  rule 15, in sub-rule (1), for words, “on oath administered by an 
officer empowered under section 137 of the Code,” 
[Vide Uttar Pradesh Act 31 of 1978, s. 4] 
 
 
 
 
* Ins. by Act 4 of 2016, s. 16 and Sch., Shall be applicable to commercial disputes of a specified value (w.e.f. 23-10-2015).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order VII — Plaint', 'ORDER VII
PLAINT') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 1 — Particulars to be contained in plaint', 'Rule 1. Particulars to be contained in plaint
The plaint shall contain the following particulars:—  
(a) the name of the Court in which the suit is brought; 
 
(b) the name, description and place of residence of the plaintiff; 
(c) the name, description and place of residence of the defendant, so far as they can be ascertained; 
(d) where the plaintiff or the defendant is a minor or a person of unsound mind, a statement to that 
effect; 
(e) the facts constituting the cause of action and when it arose;   
(f) the facts showing that the Court has jurisdiction; 
(g) the relief which the plaintiff claims; 
(h) where the plaintiff has allowed a set-off or relinquished a portion of his claim, the amount so 
allowed, or relinquished; and 
(i) a statement of the value of the subject-matter of the suit for the purposes of jurisdiction and of 
court-fees, so far as the case admits.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 2 — In money suits', 'Rule 2. In money suits
Where the plaintiff seeks the recovery of money, the plaint shall state the precise amount 
claimed : 
But where the plaintiff sues for mesne profits, or for an amount which will be found due to him on taking 
unsettled accounts between him and the defendant, 1[or for movables in the possession of the defendant, or for debts 
of which the value he cannot, after the exercise of reasonable diligence, estimate, the plaint shall state approximately 
the amount or value sued for.] 
*[2A. Where interest is sought in the suit.—(1) Where the plaintiff seeks interest, the plaint shall contain a 
statement to that effect along with the details set out under sub-rules (2) and (3).  
(2) Where the plaintiff seeks interest, the plaint shall state whether the plaintiff is seeking interest in 
relation to a commercial transaction within the meaning of section 34 of the Code of Civil                       
Procedure, 1908 (5 of 1908) and, furthermore, if the plaintiff is doing so under the terms of a contract or under 
an Act, in which case the Act is to be specified in the plaint; or on some other basis and shall state the basis of 
that.  
(3) Pleadings shall also state— 
(a) the rate at which interest is claimed; 
(b) the date from which it is claimed;  
(c) the date to which it is calculated;  
(d) the total amount of interest claimed to the date of calculation; and  
(e) the daily rate at which interest accrues after that date.] 
Jammu and Kashmir and Ladakh (UTs)― 
In Order VII, after Rule, insert the following Rule, namely:- 
 
* Ins. by Act 4 of 2016, s. 16 and Sch., Shall be applicable to commercial disputes of a Specified Value (w.e.f. 23-10-2015).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-2A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 2A — Where interest is sought in the suit', 'Rule 2A. Where interest is sought in the suit
(1) Where the plaintiff seeks interests, the plaint shall 
contain a statement to that effect along with the details set out under sub-rules (2) and (3).  
(2) Where the plaintiff seeks interest, the plaint shall state whether the plaintiff is seeking interest in 
relation to a commercial transaction within the meaning of section 34 of the Code of Civil Procedure, 
1908 and, furthermore, if the plaintiff is doing so under the terms of a contract or under an Act, in which 
case the Act is to be specified in the plaint; or on some other basis and shall state the basis of that. 
(3) Pleadings shall also state— 
(a) the rate at which interest is claimed; 
(b) the date from which it is claimed; 
(c) the date to which it is calculated; 
(d) the total amount of interest claimed to the date calculation; and 
(e) the daily rate at which interest accrues after the date. 
[Vide the Jammu and Kashmir Reorganisation (Adaptation of Central Laws) Order, 2020, notification 
No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation (Adaptation of 
Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020)].') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 3 — Where the subject-matter of the suit is immovable property', 'Rule 3. Where the subject-matter of the suit is immovable property
Where the subject-matter of the suit is 
immovable property, the plaint shall contain a description of the property sufficient to identify it, and, in case such 
property can be identified by boundaries or numbers in a record of settlement or survey, the plaint shall specify such 
boundaries or numbers.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 4 — When plaintiff sues as representative', 'Rule 4. When plaintiff sues as representative
Where the plaintiff sues in a representative character the plaint 
shall show not only that he has an actual existing interest in the subject-matter, but that he has taken the steps (if 
any) necessary to enable him to institute a suit concerning it.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 5 — Defendant’s interest and liability to be shown', 'Rule 5. Defendant’s interest and liability to be shown
The plaint shall show that the defendant is or claims to be 
interested in the subject-matter, and that he is liable to be called upon to answer the plaintiff’s demand.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 6 — Grounds of exemption from limitation law', 'Rule 6. Grounds of exemption from limitation law
Where the suit is instituted after the expiration of the period 
prescribed by the law of limitation, the plaint shall show the ground upon which exemption from such law is  
claimed: 
1[Provided that the Court may permit the plaintiff to claim exemption from the law of limitation on any ground 
not set out in the plaint, if such ground is not inconsistent with the grounds set out in the plaint.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 7 — Relief to be specifically stated', 'Rule 7. Relief to be specifically stated
Every plaint shall state specifically the relief which the plaintiff claims 
either simply or in the alternative, and it shall not be necessary to ask for general or other relief which may always 
be given as the Court may think just to the same extent as if it had been asked for. And the same rule shall apply to 
any relief claimed by the defendant in his written statement.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 8 — Relief founded on separate grounds', 'Rule 8. Relief founded on separate grounds
Where the plaintiff seeks relief in respect of several distinct claims 
or causes of action founded upon separate and distinct grounds, they shall be stated as far as may be separately and 
distinctly.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 9 — Procedure on admitting plaint', 'Rule 9. Procedure on admitting plaint
Where the Court orders that the summons be served on the defendants in 
the manner provided in rule 9 of Order V, it will direct the plaintiff to present as many copies of the plaint on 
plain paper as there are defendants within seven days from the date of such order along with requisite fee for 
service of summons on the defendants.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-310', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 310 — Return of plaint', 'Rule 310. Return of plaint
(1) 4[ Subject to the provisions of rule 10A, the plaint shall] at any stage 
of the suit be returned to be presented to the Court in which the suit should have been instituted.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-10A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 10A — Power of Court to fix a date of appearance in the Court where plaint is to be filed 
after its return', 'Rule 10A. Power of Court to fix a date of appearance in the Court where plaint is to be filed 
after its return
(1) Where, in any suit, after the defendant has appeared, the Court is of opinion 
that the plaint should be returned, it shall, before doing so, intimate its decision to the plaintiff.] 
(2) Where an intimation is given to the plaintiff under sub-rule (1), the plaintiff may make an 
application to the Court— 
(a) specifying the Court in which he proposes to present the plaint after its return, 
(b) praying that the Court may fix a date for the appearance of the parties in the said Court, 
and 
(c) requesting that the notice of the date so fixed may be given to him and to the defendant. 
(3) Where an application is made by the plaintiff under sub-rule (2), the Court shall, before 
returning the plaint and notwithstanding that the order for return of plaint was made by it on the 
ground that it has no jurisdiction to try the suit,—  
(a) fix a date for the appearance of the parties in the Court in which the plaint is proposed to 
be presented, and 
(b) give to the plaintiff and to the defendant notice of such date for appearance. 
(4) Where the notice of the date for appearance is given under sub-rule (3),—  
(a) it shall not be necessary for the Court in which the plaint is presented after its return, to 
serve the defendant with a summons for appearance in the suit, unless that Court, for reasons to be 
recorded, otherwise directs, and 
(b) the said notice shall be deemed to be a summons for the appearance of the defendant in the 
Court in which the plaint is presented on the date so fixed by the Court by which the plaint was 
returned. 
(5) Where the application made by the plaintiff under sub-rule (2) is allowed by the Court, the 
plaintiff shall not be entitled to appeal against the order returning the plaint.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-10B', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 10B — Power of appellate Court to transfer suit to the proper Court', 'Rule 10B. Power of appellate Court to transfer suit to the proper Court
(1) Where, on an appeal 
against an order for the return of plaint, the Court hearing the appeal confirms such order, the Court of 
appeal may, if the plaintiff by an application so desires, while returning the plaint, direct plaintiff to 
file the plaint, subject to the provisions of the Limitation Act, 1963 (36 of 1963), in the Court in which 
the suit should have been instituted, (whether such Court is within or without the State in which the 
Court hearing the appeal is situated), and fix a date for the appearance of the parties in the Court in 
which the plaint is directed to be filed and when the date is so fixed it shall not be necessary for the 
Court in which the plaint is filed to serve the defendant with the summons for appearance in the suit, 
unless that Court in which the plaint is filed, for reasons to be recorded, otherwise directs. 
(2) The direction made by the Court under sub-rule (1) shall be without any prejudice to the rights of 
the parties to question the jurisdiction of the Court, in which the plaint is filed, to try the suit.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 11 — Rejection of plaint', 'Rule 11. Rejection of plaint
The plaint shall be rejected in the following cases:— 
 
(a) where it does not disclose a cause of action; 
 

 
 
 
(b) where the relief claimed is undervalued, and the plaintiff, on being required by the Court to 
correct the valuation within a time to be fixed by the Court, fails to do so; 
(c) where the relief claimed is properly valued, but the plaint is returned upon paper insufficiently 
stamped, and the plaintiff, on being required by the Court to supply the requisite stamp-paper within a 
time to be fixed by the Court, fails to do so; 
(d) where the suit appears from the statement in the plaint to be barred by any law; 
1[(e) where it is not filed in duplicate;] 
2[(f) where the plaintiff fails to comply with the provisions of rule 9:] 
3[Provided that the time fixed by the Court for the correction of the valuation or supplying of the 
requisite stamp-paper shall not be extended unless the Court, for reasons to be recorded, is satisfied that 
the plaintiff was prevented by any cause of an exceptional nature from correcting the valuation or 
supplying the requisite stamp-paper, as the case may be, within the time fixed by the Court and that 
refusal to extend such time would cause grave injustice to the plaintiff.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 12 — Procedure on rejecting plaint', 'Rule 12. Procedure on rejecting plaint
Where a plaint is rejected the Judge shall record an order to that 
effect with the reasons for such order.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 13 — Where rejection of plaint does not preclude presentation of fresh plaint', 'Rule 13. Where rejection of plaint does not preclude presentation of fresh plaint
The rejection of 
the plaint on any of the grounds hereinbefore mentioned shall not of its own force preclude the plaintiff 
from presenting a fresh plaint in respect of the same cause of action. 
Documents relied on in plaint') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-14', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 14 — Production of document on which plaintiff sues or relies', 'Rule 14. Production of document on which plaintiff sues or relies
(1) Where a plaintiff sues upon a 
document or relies upon document in his possession or power in support of his claim, he shall enter such 
documents in a list, and shall produce it in Court when the plaint is presented by him and shall, at the 
same time deliver the document and a copy thereof, to be filed with the plaint. 
(2) Where any such document is not in the possession or power of the plaintiff, he shall, wherever 
possible, state in whose possession or power it is. 
5[(3) A document which ought to be produced in Court by the plaintiff when the plaint is presented, or 
to be entered in the list to be added or annexed to the plaint but is not produced or entered accordingly, 
shall not, without the leave of the Court, be received in evidence on his behalf at the hearing of the suit.] 
(4) Nothing in this rule shall apply to document produced for the cross-examination of the plaintiffs 
witnesses, or handed over to a witness merely to refresh his memory.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-15', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 15 — [Statement in case of documents not in plaintiff’s possession or powers.] omitted by Act 46 of 
1999, s', 'Rule 15. [Statement in case of documents not in plaintiff’s possession or powers.] omitted by Act 46 of 
1999, s
17 (w.e.f. 1-7-2002).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-16', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 16 — Suits on lost negotiable instruments', 'Rule 16. Suits on lost negotiable instruments
Where the suit is founded upon a negotiable instrument, 
and it is proved that the instrument is lost, and an indemnity is given by the plaintiff, to the satisfaction of 
the Court, against the claims of any other person upon such instrument, the Court may pass such decree as 
it would have passed if the plaintiff had produced the instrument in Court when the plaint was presented, 
and had at the same time delivered a copy of the instrument to be filed with the plaint.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-17', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 17 — Production of shop-book', 'Rule 17. Production of shop-book
(1) Save in so far as is otherwise provided by the Bankers’ Books Evidence 
Act, 1891 (XVIII of 1891), where the document on which the plaintiff sues is an entry in a shop-book or other 
account in his possession or power, the plaintiff shall produce the book or account at the time of filing the plaint, 
together with a copy of the entry on which he relies.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VII/R-18', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VII', 'section', 'Rule 18 — [Inadmissibility of document not produced when plaint filed.] omitted by Act 22 of 2002, s', 'Rule 18. [Inadmissibility of document not produced when plaint filed.] omitted by Act 22 of 2002, s
8                     
(w. e. f. 1-7-2002).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order VIII — 1[Written statement, set-off and counter-claim]', 'ORDER VIII
1[WRITTEN STATEMENT, SET-OFF AND COUNTER-CLAIM]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 1 — Written Statement', 'Rule 1. Written Statement
The Defendant shall, within thirty days from the date of service of 
summons on him, present a written statement of his defence: 
Provided that where the defendant fails to file the written statement within the said period of thirty 
days, he shall be allowed to file the same on such other day, as may be specified by the Court, for reasons 
to be recorded in writing, but which shall not be later than ninety days from the date of service of 
summons.] 
*[Provided that where the defendant fails to file the written statement within the said period of thirty 
days, he shall be allowed to file the written statement on such other day, as may be specified by the Court, 
for reasons to be recorded in writing and on payment of such costs as the Court deems fit, but which shall 
not be later than one hundred twenty days from the date of service of summons and on expiry of one 
hundred twenty days from the date of service of summons, the defendant shall forfeit the right to file the 
written statement and the Court shall not allow the written statement to be taken on record.] 
Jammu and Kashmir and Ladakh (UTs). — 
In Rule 1, for the proviso thereto, substitute the following proviso, namely,- 
Provided that where the defendant fails to file the written statement with the said period of thirty days, 
he shall be allowed to file the written statement on such other day, as may be specified by the court, for 
reasons to be recorded in writing and on payment of such costs as the court deems fit, but which shall not 
be later than one hundred twenty days from the date of service of summons and on expiry of one hundred 
twenty days from the date of service of summons, the defendant shall forfeit the right to file the written 
statement and the court shall not allow the written statement to be taken on record. 
[Vide the Jammu and Kashmir Reorganisation (Adaptation of Central Laws) Order, 2020,  
notification No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation 
(Adaptation of Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020)].') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-1A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 1A — Duty of defendant to produce documents upon which relief is claimed or relied upon by 
him', 'Rule 1A. Duty of defendant to produce documents upon which relief is claimed or relied upon by 
him
(1) Where the defendant bases his defence upon a document or relies upon any document in his 
possession or power, in support of his defence or claim for set-off or counter-claim, he shall enter such 
document in a list, and shall produce it in Court when the written statement is presented by him and shall, at 
the same time, deliver the document and a copy thereof, to be filed with the written statement. 
(2) Where any such document is not in the possession or power of the defendant, he shall, wherever 
possible, state in whose possession or power it is. 
 
 
* Subs. by Act 4 of 2016, s. 16 and Sch., for the Proviso, Shall be applicable to commercial disputes of a specified value                
(w.e.f. 23-10-2015). 

 
 
 
1[(3) A document which ought to be produced in Court by the defendant under this rule, but, is not so 
produced shall not, without the leave of the Court, be received in evidence on his behalf at the hearing of 
the suit.] 
(4) Nothing in this rule shall apply to documents— 
(a) produced for the cross-examination of the plaintiff’s witnesses, or 
(b) handed over to a witness merely to refresh his memory.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 2 — New facts must be specially pleaded', 'Rule 2. New facts must be specially pleaded
The defendant must raise by his pleading all matters which 
show the suit not be maintainable, or that the transaction is either void or voidable in point of law, and all 
such grounds of defence as, if not raised, would be likely to take the opposite party by surprise, or would 
raise issues of fact not arising out of the plaint, as, for instance, fraud, limitation, release, payment, 
performance, or facts showing illegality.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 3 — Denial to be specific', 'Rule 3. Denial to be specific
It shall not be sufficient for a defendant in his written statement to deny 
generally the grounds alleged by the plaintiff, but the defendant must deal specifically with each 
allegation of fact of which he does not admit the truth, except damages. 
*[3A. Denial by the defendant in suits before the Commercial Division of the High Court or the 
Commercial Court.—(1) Denial shall be in the manner provided in sub-rules (2), (3), (4) and (5) of this 
Rule.  
(2) The defendant in his written statement shall state which of the allegations in the particulars of 
plaint he denies, which allegations he is unable to admit or deny, but which he requires the plaintiff to 
prove, and which allegations he admits.  
(3) Where the defendant denies an allegation of fact in a plaint, he must state his reasons for doing so 
and if he intends to put forward a different version of events from that given by the plaintiff, he must state 
his own version. 
(4) If the defendant disputes the jurisdiction of the Court he must state the reasons for doing so, and if 
he is able, give his own statement as to which Court ought to have jurisdiction.   
(5) If the defendant disputes the plaintiff’s valuation of the suit, he must state his reasons for doing so, 
and if he is able, give his own statement of the value of the suit.] 
Jammu and Kashmir and Ladakh (UTs).― 
After Rue 3, insert the following Rule, namely,- 
“3A. Denial by the defendant in suits.—(1) Denial shall be in the manner provided in sub-rules (2), 
(3), (4) and (5) of this rule. 
(2) The defendant in his written statement shall state which of the allegations in the particulars of 
plaint he denies, which allegations he is unable to admit or deny, but which he requires the plaintiff to 
prove, and which allegations he admits. 
(3) Where the defendant denies an allegation of fact in a plaint, he must state his reasons for doing so 
and if he intends to put forward a different version of events from that given by the plaintiff, he must state 
his own version. 
(4) If the defendant disputes the jurisdiction of the court he must state the reasons for doing so, and if 
he is able, give his own statement as to which court ought to have jurisdiction.  
(5) If the defendant disputes the plaintiff valuation of the suit, he must state his reasons for doing so, 
and if he is able, give his own statement of the value of the suit. 
[Vide the Jammu and Kashmir Reorganisation (Adaptation of Central Laws) Order, 2020, notification 
No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation (Adaptation of 
Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020)]. 
 
* Ins. by Act 4 of 2016, s. 16 and Sch., Shall be applicable to commercial disputes of a specified value (w.e.f. 23-10-2015).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 4 — Evasive-denial', 'Rule 4. Evasive-denial
Where a defendant denies an allegation of fact in the plaint, he must not do so 
evasively, but answer the point of substance. Thus, if it is alleged that he received a certain sum of 
money, it shall not be sufficient to deny that he received that particular amount, but he must deny that he 
received that sum or any part thereof, or else set out how much he received. And if an allegation is made 
with diverse circumstances, it shall not be sufficient to deny it along with those circumstances.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 5 — Specific denial', 'Rule 5. Specific denial
1[(1)] Every allegation of fact in the plaint, if not denied specifically or by 
necessary implication, or stated to be not admitted in the pleading of the defendant, shall be taken to be 
admitted except as against a person under disability: 
Provided that the Court may in its discretion require any fact so admitted to be proved otherwise than 
by such admission: 
*[Provided further that every allegation of fact in the plaint, if not denied in the manner provided 
under Rule 3A of this Order, shall be taken to be admitted except as against a person under disability.] 
2[(2) Where the defendant has not filed a pleading, it shall be lawful for the court to pronounce 
judgment on the basis of the facts contained in the plaint, except as against a person under a disability, but 
the Court may, in its discretion, require any such fact to be proved. 
(3) In exercising its discretion under the proviso to sub-rule (1) or under sub-rule (2), the Court shall 
have due regard to the fact whether the defendant could have, or has, engaged a pleader. 
(4) Whenever a judgment is pronounced under this rule, a decree shall be drawn up in accordance 
with such judgment and such decree shall bear the date on which the judgment was pronounced.] 
Jammu and Kashmir and Ladakh (UTs).— 
In Rule 5, in sub-rule (1) after first proviso thereto, insert the following proviso, namely:- 
 Provided further, that every allegation of fact in the plaint, if not denied in the manner provided 
under Rue 3-A of this order, shall be taken to be admitted except as against a person under disability. 
[Vide the Jammu and Kashmir Reorganisation (Adaptation of Central Laws) Order, 2020, notification 
No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation (Adaptation of 
Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020)].') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 6 — Particulars of set-off to be given in written statement', 'Rule 6. Particulars of set-off to be given in written statement
(1) Where in a suit for the recovery of 
money the defendant claims to set-off against the plaintiff’s demand any ascertained sum of money legally 
recoverable by him from the plaintiff, not exceeding the pecuniary limits of the jurisdiction of the Court, and 
both parties fill the same character as they fill in the plaintiff’s suit, the defendant may, at the first hearing of 
the suit, but not afterwards unless permitted by the Court, presents a written statement containing the 
particulars of the debt sought to be set-off. 
(2) Effect of set-off.—The written statement shall have the same effect as a plaint in a cross-suit so as 
to enable the Court to pronounce a final judgment in respect both of the original claim and of the set-off: 
but this shall not affect the lien, upon the amount decreed, of any pleader in respect of the costs payable to 
him under the decree. 
(3) The rules relating to a written statement by a defendant apply to a written statement in answer to a 
claim of set-off. 
Illustrations 
(a) A bequeaths Rs. 2,000 to B and appoints C his executor and residuary legatee. B dies and D takes out administration 
to B''s effects, C pays Rs, 1,000 as surety for D; then D sues C for the legacy. C cannot set-off the debt of Rs. 1,000 
against the legacy, for neither C nor D fills the same character with respect to the legacy as they fill with respect to 
the payment of the Rs. 1,000. 
(b) A dies intestate and in debt to B. C takes out administration to A’s effects and B buys part of the effects from C. 
In a suit for the purchase-money by C against B, the latter cannot set-off the debt against the price, for C fills 
two different characters, one as the vendor to B, in which he sues B, and the other as representative to A.  
(c) A sues B on a bill of exchange. B alleges that A has wrongfully neglected to insure B’s goods and is liable to him in 
compensation which he claims to set-off. The amount not being ascertained cannot be set-off.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-6A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 6A — Counter-claim by defendant', 'Rule 6A. Counter-claim by defendant
(1) A defendant in a suit may, in addition to his right of 
pleading a set-off under rule 6, set up, by way of counter-claim against the claim of the plaintiff, any 
right or claim in respect of a cause of action accruing to the defendant against the plaintiff either before 
or after the filing of the suit but before the defendant has delivered his defence or before the time limited 
for delivering his defence has expired, whether such counter-claim is in the nature of a claim for 
damages or not: 
Provided that such counter-claim shall not exceed the pecuniary limits of the jurisdiction of the 
court. 
(2) Such counter-claim shall have the same effect as a cross-suit so as to enable the Court to                     
pronounce a final judgment in the same suit, both on the original claim and on the counter-claim. 
(3) The plaintiff shall be at liberty to file a written statement in answer to the counter-claim of the 
defendant within such period as may be fixed by the court. 
(4) The counter-claim shall be treated as a plaint and governed by the rules applicable to plaints.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-6B', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 6B — Counter-claim to be stated', 'Rule 6B. Counter-claim to be stated
Where any defendant seeks to rely upon any ground as supporting 
a right of counter-claim, he shall, in his written statement, state specifically that he does so by way of 
counter-claim.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-6C', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 6C — Exclusion of counter-claim', 'Rule 6C. Exclusion of counter-claim
Where a defendant sets up a counter-claim and the plaintiff         
contends that the claim thereby raised ought not to be disposed of by way of counter-claim but in an        
independent suit, the plaintiff may, at any time before issues are settled in relation to the counter-claim, 
apply to the Court for an order that such counter-claim may be excluded, and the Court may, on the 
hearing of such application make such order as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-6D', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 6D — Effect of discontinuance of suit', 'Rule 6D. Effect of discontinuance of suit
If in any case in which the defendant sets up a counter-claim, 
the suit of the plaintiff is stayed, discontinued or dismissed, the counter-claim may nevertheless be 
proceeded with.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-6E', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 6E — Default of plaintiff to reply to counter-claim', 'Rule 6E. Default of plaintiff to reply to counter-claim
If the plaintiff makes default in putting in a 
reply to the counter-claim made by the defendant, the Court may pronounce judgment against the plaintiff 
in relation to the counter-claim made against him, or make such order in relation to the counter-claim as it 
thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-6F', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 6F — Relief to defendant where counter-claim succeeds', 'Rule 6F. Relief to defendant where counter-claim succeeds
Where in any suit a set-off or        
counter-claim is established as a defence against the plaintiff’s claim and any balance is found due to 
the plaintiff or the defendant, as the case may be, the Court may give judgment to the party entitled 
to such balance.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-6G', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 6G — Rules relating to written statement to apply', 'Rule 6G. Rules relating to written statement to apply
The rules relating to a written statement by a 
defendant shall apply to a written statement filed in answer to a counter-claim.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 7 — Defence or set-off founded upon separate grounds', 'Rule 7. Defence or set-off founded upon separate grounds
Where the defendant relies upon several 
distinct grounds of defence or set-off  1[or counter-claim] founded upon separate and distinct facts, they 
shall be stated, as far as may be, separately and distinctly.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 8 — New ground of defence', 'Rule 8. New ground of defence
Any ground of defence which has arisen after the institution of the suit 
or the presentation of a written statement claiming a set-off 1[or counter-claim] may be raised by the 
defendant or plaintiff, as the case may be, in his written statement.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-8A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 8A — [Duty of defendant to produce documents upon which relief is claimed by him.] omitted by Act  
46 of 1999, s', 'Rule 8A. [Duty of defendant to produce documents upon which relief is claimed by him.] omitted by Act  
46 of 1999, s
18 (w.e.f. 1-7-2002).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 9 — Subsequent pleadings', 'Rule 9. Subsequent pleadings
No pleading subsequent to the written statement of a defendant other 
than by way of defence to set-off or counter-claim shall be presented except by the leave of the Court 
 

 
 
 
and upon such terms as the Court thinks fit; but the Court may at any time require a written statement or 
additional written statement from any of the parties and fix a time of not more than thirty days for 
presenting the same.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-VIII/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-VIII', 'section', 'Rule 10 — Procedure when party fails to present written statement called for by Court', 'Rule 10. Procedure when party fails to present written statement called for by Court
Where any 
party from whom a written statement is required under rule 1 or rule 9 fails to present the same within the 
time permitted or fixed by the Court, as the case may be, the Court shall pronounce judgment against him, 
or make such order in relation to the suit as it thinks fit and on the pronouncement of such judgment a 
decree shall be drawn up:] 
*[Provided that no Court shall make an order to extend the time provided under Rule 1 of this Order 
for filing of the written statement.] 
Jammu and Kashmir and Ladakh (UTs).― 
In Rule 10, insert the following proviso, namely:- 
Provided that no court shall make an order to extend the time provided under Rule 1 of this order for 
filing of the written statement. 
[Vide the Jammu and Kashmir Reorganisation (Adaptation of Central Laws) Order, 2020, notification 
No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation (Adaptation of 
Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020)].') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order IX — Appearance of parties and consequence of non-appearance', 'ORDER IX
APPEARANCE OF PARTIES AND CONSEQUENCE OF NON-APPEARANCE') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 1 — Parties to appear on day fixed in summons for defendant to appear and answer', 'Rule 1. Parties to appear on day fixed in summons for defendant to appear and answer
On the day 
fixed in the summons for the defendant to appear and answer, the parties shall be in attendance at the 
Court-house in person or by their respective pleaders, and the suit shall then be heard unless the hearing is 
adjourned to a future day fixed by the Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 2 — Dismissal of suit where summons not served in consequence of plaintiff''s failure to pay 
costs', 'Rule 2. Dismissal of suit where summons not served in consequence of plaintiff''s failure to pay 
costs
Where on the day so fixed it is found that summons has not been served upon the defendant in 
consequence of the failure of the plaintiff to pay the court-fee or postal charges, if any, chargeable for 
such service, or failure to present copies of the plaint as required by rule 9 of Order VII, the Court may 
make an order that the suit be dismissed: 
Provided that no such order shall be made, if notwithstanding such failure, the defendant attends in 
person or by agent when he is allowed to appear by agent on the day fixed for him to appear and answer.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 3 — Where neither party appears suit to be dismissed', 'Rule 3. Where neither party appears suit to be dismissed
Where neither party appears when the suit 
is called on for hearing, the court may make an order that the suit be dismissed.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 4 — Plaintiff may bring fresh suit or Court may restore suit to file', 'Rule 4. Plaintiff may bring fresh suit or Court may restore suit to file
Where a suit is dismissed 
under rule 2 or rule 3, the plaintiff may (subject to the law of limitation) bring a fresh suit; or he may 
apply for an order to set the dismissal aside, and if he satisfies the Court that there was sufficient cause for 
2[such failure as is referred to in rule 2], or for his non-appearance, as the case may be, the Court shall 
make an order setting aside the dismissal and shall appoint a day for proceeding with the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 5 — Dismissal of suit where plaintiff after summons returned unserved, fails for 3[seven days] to 
apply for fresh summons', 'Rule 5. Dismissal of suit where plaintiff after summons returned unserved, fails for 3[seven days] to 
apply for fresh summons
4[(1) Where after a summons has been issued to the defendant, or to one of 
several defendants, and returned unserved, the plaintiff fails, for a period of  3[seven days] from the date of 
the return made to the Court by the officer ordinarily certifying to the Court returns made by the serving 
officers, to apply for the issue of a fresh summons the Court shall make an order that the suit be dismissed as 
against such defendant, unless the plaintiff has within the said period satisfied the Court that—  
 (a) he has failed after using his best endeavours to discover the residence of the defendant, who 
has not been served, or 
 
* Ins. by Act 4 of 2016, s. 16 and Sch., Shall be applicable to commercial disputes of a specified value (w.e.f. 23-10-2015).  

 
 
 
(b) such defendant is avoiding service of process, or 
(c) there is any other sufficient cause for extending the time, 
in which case the Court may extend the time for making such application for such period as it thinks fit.] 
(2) In such case the plaintiff may (subject to the law of limitation) bring a fresh suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 6 — Procedure when only plaintiff appears', 'Rule 6. Procedure when only plaintiff appears
(1) Where the plaintiff appears and the defendant does 
not appear when the suit is called on for hearing, then— 
1[(a) When summons duly served.—if it is proved that the summons was duly served, the Court 
may make an order that the suit shall be heard ex parte;] 
(b) When summons not duly served.—if it is not proved that the summons was duly served, the 
Court shall direct a second summons to be issued and served on the defendant; 
(c) When summons served but not in due time.—if it is proved that the summons was served 
on the defendant, but not in sufficient time to enable him to appear and answer on the day fixed in the 
summons, 
the Court shall postpone the hearing of the suit to a future day to be fixed by the Court, and shall direct 
notice of such day to be given to the defendant. 
(2) Where it is owing to the plaintiff’s default that the summons was not duly served or was not served 
in sufficient time, the Court shall order the plaintiff to pay the costs occasioned by the postponement.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 7 — Procedure where defendant appears on day of adjourned hearing and assigns good cause for 
previous non-appearance', 'Rule 7. Procedure where defendant appears on day of adjourned hearing and assigns good cause for 
previous non-appearance
Where the Court has adjourned the hearing of the suit, ex parte, and the 
defendant, at or before such hearing appears and assigns good cause for his previous non-appearance, he may, 
upon such terms as the Court directs as to costs or otherwise, be heard in answer to the suit as if he had 
appeared on the day fixed for his appearance.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 8 — Procedure where defendant only appears', 'Rule 8. Procedure where defendant only appears
Where the defendant appears and the plaintiff does 
not appear when the suit is called on for hearing, the Court shall make an order that the suit be dismissed, 
unless the defendant admits the claim, or part thereof, in which case the Court shall pass a decree against 
the defendant upon such admission, and where part only of the claim has been admitted, shall dismiss the 
suit so far as it relates to the remainder.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 9 — Decree against plaintiff by default bars fresh suit', 'Rule 9. Decree against plaintiff by default bars fresh suit
(1) Where a suit is wholly or partly                     
dismissed under rule 8, the plaintiff shall be precluded from bringing a fresh suit in respect of the same 
cause of action. But he may apply for an order to set the dismissal aside, and if he satisfies the Court that 
there was sufficient cause for his non-appearance when the suit was called on for hearing, the Court shall 
make an order setting aside the dismissal upon such terms as to costs or otherwise as it thinks fit, and 
shall appoint a day for proceeding with the suit. 
(2) No order shall be made under this rule unless notice of the application has been served on the 
opposite party.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 10 — Procedure in case of non-attendance of one or more of several plaintiff’s', 'Rule 10. Procedure in case of non-attendance of one or more of several plaintiff’s
Where there are 
more plaintiffs than one, and one or more of them appear and the others do not appear, the Court may, at 
the instance of the plaintiff or plaintiff’s appearing, permit the suit to proceed in the same way as if all the 
plaintiff’s had appeared, or make such order as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 11 — Procedure in case of non-attendance of one or more of several defendants', 'Rule 11. Procedure in case of non-attendance of one or more of several defendants
Where there are 
more defendants than one, and one or more of them appear, and the others do not appear, the suit shall 
proceed, and the Court shall, at the time of pronouncing judgment, make such order as it thinks fit with 
respect to the defendants who do not appear.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 12 — Consequence of non-attendance, without sufficient cause shown, of party ordered to appear 
in person', 'Rule 12. Consequence of non-attendance, without sufficient cause shown, of party ordered to appear 
in person
Where a plaintiff or defendant, who has been ordered to appear in person, does not appear in 
person, or show sufficient cause to the satisfaction of the court for failing so to appear, he shall be subject 
to all provisions of the foregoing rules applicable to plaintiffs and defendants, respectively who do not 
appear. 
 
 
 

 
 
 
Setting aside Decrees ex parte') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 13 — Setting aside decree ex parte against defendant', 'Rule 13. Setting aside decree ex parte against defendant
In any case in which a decree is passed        
ex parte against a defendant, he may apply to the Court by which the decree was passed for an order to set 
it aside; and if he satisfies the Court that the summons was not duly served, or that he was prevented by 
any sufficient cause from appearing when the suit was called on for hearing, the Court shall make an 
order setting aside the decree as against him upon such terms as to costs, payment into Court or otherwise 
as it thinks fit, and shall appoint a day for proceeding with the suit: 
Provided that where the decree is of such a nature that it cannot be set aside as against such defendant 
only it may be set aside as against all or any of the other defendants also: 
1[Provided further that no Court shall set aside a decree passed ex parte merely on the ground that 
there has been an irregularity in the service of summons, if it is satisfied that the defendant had notice of 
the date of hearing and had sufficient time to appear and answer the plaintiff’s claim.] 
2[Explanation.—Where there has been an appeal against a decree passed ex parte under this rule, and 
the appeal has been disposed of an any ground other than the ground that the appellant has withdrawn the 
appeal, no application shall lie under this rule for setting aside that ex parte decree.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-IX/R-14', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-IX', 'section', 'Rule 14 — No decree to be set aside without notice to opposite party', 'Rule 14. No decree to be set aside without notice to opposite party
No decree shall be set aside on 
any such application as aforesaid unless notice thereof has been served on the opposite party.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-X', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order X — Examination of parties by the court', 'ORDER X
EXAMINATION OF PARTIES BY THE COURT') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-X/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-X', 'section', 'Rule 1 — Ascertainment whether allegations in pleadings are admitted or denied', 'Rule 1. Ascertainment whether allegations in pleadings are admitted or denied
At the first hearing 
of the suit the Court shall ascertain from each party or his pleader whether he admits or denies such 
allegations of fact as are made in the plaint or written statement (if any) of the opposite party, and as are 
not expressly or by necessary implication admitted or denied by the party against whom they are made. 
The Court shall record such admissions and denials.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-X/R-1A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-X', 'section', 'Rule 1A — Direction of the court to opt for any one mode of alternative dispute resolution', 'Rule 1A. Direction of the court to opt for any one mode of alternative dispute resolution
After 
recording the admissions and denials, the court shall direct the parties to the suit to opt either mode of the 
settlement outside the court as specified in sub-section (1) of section 89. On the option of the parties, the 
court shall fix the date of appearance before such forum or authority as may be opted by the parties.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-X/R-1B', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-X', 'section', 'Rule 1B — Appearance before the conciliatory forum or authority', 'Rule 1B. Appearance before the conciliatory forum or authority
Where a suit is referred under                 
rule 1A, the parties shall appear before such forum or authority for conciliation of the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-X/R-1C', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-X', 'section', 'Rule 1C — Appearance before the court consequent to the failure of efforts of conciliation', 'Rule 1C. Appearance before the court consequent to the failure of efforts of conciliation
Where a suit is 
referred under rule 1A, and the presiding officer of conciliation forum or authority is satisfied that it 
would not be proper in the interest of justice to proceed with the matter further, then, it shall refer the 
matter again to the court and direct the parties to appear before the court on the date fixed by it.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-X/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-X', 'section', 'Rule 2 — Oral examination of party, or companion of party', 'Rule 2. Oral examination of party, or companion of party
(1) At the first hearing of the suit, the Court— 
(a) shall, with a view to elucidating matters in controversy in the suit examine orally such of the 
parties to the suit appearing in person or present in Court, as it deems fit; and 
(b) may orally examine any person, able to answer any material question relating to the suit, by 
whom any party appearing in person or present in Court or his pleader is accompanied. 
(2) At any subsequent hearing, the Court may orally examine any party appearing in person or 
present in Court, or any person, able to answer any material question relating to the suit, by whom such 
party or his pleader is accompanied. 
(3) The Court may, if it thinks fit, put in the course of an examination under this rule questions 
suggested by either party.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-X/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-X', 'section', 'Rule 13 — Substance of examination to be written', 'Rule 13. Substance of examination to be written
The substance of the examination shall be reduced 
to writing by the Judge, and shall form part of the record.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-X/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-X', 'section', 'Rule 4 — Consequence of refusal or inability of pleader to answer', 'Rule 4. Consequence of refusal or inability of pleader to answer
(1) Where the pleader of any party 
who appears by a pleader or any such person accompanying a pleader as is referred to in rule 2, refuses 
or is unable to answer any material question relating to the suit which the Court is of opinion that the 
party whom he represents ought to answer, and is likely to be able to answer if interrogated in person, 
the Court 2[may postpone the hearing of the suit to a day not later than seven days from the date of first 
hearing] and direct that such party shall appear in person on such day. 
(2) If such party fails without lawful excuse to appear in person on the day so appointed, the Court 
may pronounce judgment against him, or make such order in relation to the suit as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XI — Discovery  and  Inspection', 'ORDER XI
DISCOVERY  AND  INSPECTION') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 1 — Discovery by interrogatories', 'Rule 1. Discovery by interrogatories
In any suit the plaintiff or defendant by leave of the Court may deliver 
interrogatories in writing for the examination of the opposite parties or any one or more of such parties and 
such interrogatories when delivered shall have a note at the foot thereof stating which of such interrogatories 
each of such person is required to answer: Provided that no party shall deliver more than one set of 
interrogatories to the same party without an order for that purpose: Provided also that interrogatories which do 
not relate to any matters in question in the suit shall be deemed irrelevant, notwithstanding that they might be 
admissible on the oral cross-examination of a witness.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 2 — Particular interrogatories to be submitted', 'Rule 2. Particular interrogatories to be submitted
On an application for leave to deliver interrogatories, 
the particular interrogatories proposed to be delivered shall be submitted to the Court 3[and that court shall 
decide within seven days from the day of filing of the said application]. In deciding upon such application, 
the Court shall take into account any offer, which may be made by the party sought to be interrogated to 
deliver particulars, or to make admissions, or to produce documents relating to the matters in question, or 
any of them, and leave shall be given as to such only of the interrogatories submitted as the Court shall 
consider necessary either for disposing fairly of the suit or for saving costs.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 3 — Costs of interrogatories', 'Rule 3. Costs of interrogatories
In adjusting the costs of the suit inquiry shall at the instance of any 
party be made into the propriety of exhibiting such interrogatories, and if it is the opinion of the taxing 
officer or of the Court, either with or without an application for inquiry, that such interrogatories have 
been exhibited unreasonably, vexatiously, or at improper length, the cost occasioned by the 
interrogatories and the answers thereto shall be paid in any even by the party in fault.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 4 — Form of interrogatories', 'Rule 4. Form of interrogatories
Interrogatories shall be in Form No. 2 in Appendix C, with such 
variations as circumstances may require.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 5 — Corporations', 'Rule 5. Corporations
Where any party to a suit is a corporation or a body of persons, whether 
incorporated or not, empowered by law to sue or be sued, whether in its own name or in the name of any 
officer or other person, any opposite party may apply for an order allowing him to deliver interrogatories 
to any member or officer of such corporation or body, and an order may be made accordingly.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 6 — Objections to interrogatories by answer', 'Rule 6. Objections to interrogatories by answer
Any objection to answering any interrogatory on the 
ground that it is scandalous or irrelevant or not exhibited bona fide for the purpose of the suit, or that the 
matters inquired into are not sufficiently material at that stage, 4[or on the ground of privilege or any 
other ground], may be taken in the affidavit in answer.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 7 — Setting aside and striking out interrogatories', 'Rule 7. Setting aside and striking out interrogatories
Any interrogatories may be set aside on the 
ground that they have been exhibited unreasonably or vexatiously, or struck out on the ground that they 
are prolix, oppressive, unnecessary or scandalous; and any application for this purpose may be made 
within seven days after service of the interrogatories.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 8 — Affidavit in answer, filing', 'Rule 8. Affidavit in answer, filing
Interrogatories shall be answered by affidavit to be filed within ten 
days or within such other time as the Court may allow.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 9 — Form of affidavit in answer', 'Rule 9. Form of affidavit in answer
An affidavit in answer to interrogatories shall be in Form No. 3 in 
Appendix C, with such variations as circumstances may require.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 10 — No exception to be taken', 'Rule 10. No exception to be taken
No exceptions shall be taken to any affidavit in answer, but the 
sufficiency or otherwise of any such affidavit objected to as insufficient shall be determined by the 
Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 11 — Order to answer or answer further', 'Rule 11. Order to answer or answer further
Where any person interrogated omits to answer, or 
answer insufficiently, the party interrogating may apply to the Court for an order requiring him to 
answer, or to answer further, as the case may be. And an order may be made requiring him to answer or 
answer further, either by affidavit or by viva voce examination, as the Court may direct.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 12 — Application for discovery of documents', 'Rule 12. Application for discovery of documents
Any party may, without filing any affidavit, apply to 
the Court for an order directing any other party to any suit to make discovery on oaths of the documents 
which are or have been in his possession or power, relating to any matter in question therein. On the 
hearing of such application the Court may either refuse or adjourn the same, if satisfied that such 
discovery is not necessary, or not necessary at that stage of the suit, or make such order, either generally 
or limited to certain classes of documents, as may, in its discretion be thought fit: Provided that 
discovery shall not be ordered when and so far as the Court shall be of opinion that it is not necessary 
either for disposing fairly of the suit or for saving costs.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 13 — Affidavit of documents', 'Rule 13. Affidavit of documents
The affidavit to be made by a party against whom such order as is 
mentioned in the last preceding rule has been made, shall specify which (if any) of the documents therein 
mentioned he objects to produce, and it shall be in Form No. 5 in Appendix C, with such variations as 
circumstances may require.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-14', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 14 — Production of documents', 'Rule 14. Production of documents
It shall be lawful for the Court, at any time during the pendency of 
any suit, to order the production by any party thereto, upon oath, of such of the documents in his 
possession or power, relating to any matter in question in such suit, as the Court shall think right; and the 
Court may deal with such documents, when produced, in such manner as shall appear just.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-15', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 15 — Inspection of documents referred to in pleadings or affidavits', 'Rule 15. Inspection of documents referred to in pleadings or affidavits
Every party to a suit shall be 
entitled 1[at or before the settlement of issues] to give notice to any other party, in whose pleadings or 
affidavits reference is made to any document, 2[or who has entered any document in any list annexed to 
his pleadings,] to produce such document for the inspection of the party giving such notice, or of his 
pleader, and to permit him or them to take copies thereof; and any party not complying with such notice 
shall not afterwards be at liberty to put any such document in evidence on his behalf in such suit unless 
he shall satisfy the Court that such document relates only to his own title, he being a defendant to the 
suit, or that he had some other cause or excuse which the Court shall deem sufficient for not complying 
with such notice, in which case the Court may allow the same to be put in evidence on such terms as to 
costs and otherwise as the Court shall think fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-16', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 16 — Notice to produce', 'Rule 16. Notice to produce
Notice to any party to produce any documents referred to in his pleading or 
affidavits shall be in Form No. 7 in Appendix C, with such variations as circumstances may require.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-17', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 17 — Time for inspection when notice given', 'Rule 17. Time for inspection when notice given
The party to whom such notice is given shall, within 
ten days from the receipt of such notice, deliver to the party giving the same a notice stating a time within 
three days from the delivery thereof at which the documents, or such of them as he does not object to 
produce, may be inspected at the office of his pleader, or in the case of bankers’ books or other books of 
account or books in constant use for the purposes of any trade or business, at their usual place of custody, 
and stating which (if any) of the documents he objects to produce, and on what ground. Such notice shall 
be in Form No. 8 in Appendix C, with such variations as circumstances may require.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-18', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 18 — Order for inspection', 'Rule 18. Order for inspection
(1) Where the party served with notice rule 15 omits to give such notice 
of a time for inspection or objects to give inspection, or offers inspection elsewhere than at the office of 
 

 
 
 
his pleader, the Court may, on the application of the party desiring it, make an order for inspection in such 
place and in such manner as it may think fit:  
Provided that the order shall not be made when and so far as the Court shall be of opinion that it is not 
necessary either for disposing fairly of the suit or for saving costs. 
(2) Any application to inspect documents, except such as are referred to in the pleadings, particulars 
or affidavit of the party against whom the application is made or disclosed in his affidavit of documents, 
shall be founded upon an affidavit showing of what documents inspection is sought, that the party 
applying is entitled to inspect them, and that they are in the possession or power of the other party. The 
Court shall not make such order for inspection of such documents when and so far as the Court shall be of 
opinion that it is not necessary either for disposing fairly of the suit or for saving costs.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-19', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 19 — Verified copies', 'Rule 19. Verified copies
(1) Where inspection of any business books is applied for, the Court may, if it 
thinks fit, instead of ordering inspection of the original books, order a copy of any entries therein to be 
furnished and verified by the affidavit of some person who has examined the copy with the original 
entries, and such affidavit shall state whether or not there are in the original book any and what erasures, 
interlineations or alterations:  
Provided that, notwithstanding that such copy has been supplied, the Court may order inspection of 
the book from which the copy was made. 
(2) Where on an application for an order for inspection privilege is claimed for any document, it shall 
be lawful for the Court to inspect the document for the purpose of deciding as to the validity of the claim 
of privilege 1[unless the document relates to matters of State.] 
(3) The Court may, on the application of any party to suit at any time, and whether an affidavit of 
documents shall or shall not have already been ordered or made, make an order requiring any other 
party to state by affidavit whether any one or more specific documents, to be specified in the 
application, is or are, or has or have at any time been, in his possession or power; and, if not then in 
his possession, when he parted with the same and what has become thereof. Such application shall be 
made on an affidavit stating that in the belief of the deponent the party against whom the application 
is made has, or has at some time had in his possession or power the document or documents specified 
in the application, and that they relate to the matters in question in the suit, or to some of them.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-20', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 20 — Premature discovery', 'Rule 20. Premature discovery
Where the party from whom discovery of any kind or inspection is 
sought objects to the same, or any part thereof, the Court may, if satisfied that the right to the discovery or 
inspection sought depends on the determination of any issue or question in dispute in the suit, or that for 
any other reason it is desirable that any issue or question in dispute in the suit should be determined 
before deciding upon the right to the discovery or inspection, order that such issue or question be 
determined first, and reserve the question as to the discovery or inspection.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-21', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 21 — Non-compliance with order for discovery', 'Rule 21. Non-compliance with order for discovery
2[(1)] Where any party fails to comply with any order to 
answer interrogatories, or for discovery or inspection of documents, he shall, if a plaintiff, be liable to have his 
suit dismissed for want of prosecution, and, if a defendant, to have his defence, if any struck out, and to be 
placed in the same position as if he had not defended, and the party interrogating or seeking discovery or 
inspection may apply to the Court for an order to that effect and 3[an order may be made on such 
application accordingly, after notice to the parties and after giving them a reasonable opportunity of being 
heard.] 
4[(2) Where an order is made under sub-rule (1) dismissing any suit, the plaintiff shall be precluded 
from bringing a fresh suit on the same cause of action.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-22', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 22 — Using answer to interrogatories at trial', 'Rule 22. Using answer to interrogatories at trial
Any party may, at the trial of a suit, use in evidence 
any one or more of the answers or any part of an answer of the opposite party to interrogatories without 
putting in the others or the whole of such answer :  
Provided always that in such case the Court may look at the whole of the answers, and if it shall be of 
opinion that any others of them are so connected with those put in that the last-mentioned answer ought 
not to be used without them, it may direct them to be put in.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XI/R-23', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XI', 'section', 'Rule 23 — Order to apply to minors', 'Rule 23. Order to apply to minors
This Order shall apply to minor plaintiffs and defendants, and to the 
next friends and guardians for the suit of persons under disability.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XII — Admissions', 'ORDER XII
ADMISSIONS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 1 — Notice of admission of case', 'Rule 1. Notice of admission of case
Any party to a suit may give notice, by his pleading, or otherwise in 
writing, that he admits the truth of the whole or any part of the case of any other party.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 2 — Notice to admit documents', 'Rule 2. Notice to admit documents
Either party may call upon the other party 1[to admit, within 
2[seven] days from the date of service of the notice any document,] saving all exceptions; and in case of 
refusal or neglect to admit, after such notice, the costs of proving any such document shall be paid by                 
the party so neglecting or refusing, whatever the result of the suit may be, unless the Court otherwise 
directs; and no costs of proving any document shall be allowed unless such notice is given, except where 
the omission to give the notice is, in the opinion of the Court, a saving of expense.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-2A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 2A — Document to be deemed to be admitted if not denied after service of notice to admit 
documents', 'Rule 2A. Document to be deemed to be admitted if not denied after service of notice to admit 
documents
(1) Every document which a party is called upon to admit, if not denied specifically or by 
necessary implication, or stated to be not admitted in the pleading of that party or in his reply to the notice 
to admit documents, shall be deemed to be admitted except as against a person under a disability: 
Provided that the Court may, in its discretion and for reasons to be recorded, require any document so 
admitted to be proved otherwise than by such admission. 
(2) Where a party unreasonably neglects or refuses to admit a document after the service on him of the 
notice to admit documents, the Court may direct him to pay costs to the other party by way of 
compensation.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 3 — Form of notice', 'Rule 3. Form of notice
A notice to admit documents shall be in Form No. 9 in Appendix C, with such 
variations as circumstances may require.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-3A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 3A — Power of Court to record admission', 'Rule 3A. Power of Court to record admission
Notwithstanding that no notice to admit documents 
has been given under rule 2, the Court may, at any stage of the proceeding before it, of its own motion, 
call upon any party to admit any document and shall, in such a case, record whether the party admits or 
refuses or neglects to admit such document.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 4 — Notice to admit acts', 'Rule 4. Notice to admit acts
Any party, may, by notice in writing, at any time not later than nine days 
before the day fixed for the hearing, call on any other party to admit, for the purposes of the suit only, any 
specific fact or facts, mentioned in such notice. And in case of refusal or neglect to admit the same within 
six days after service of such notice, or within such further time as may be allowed by the Court, the costs 
of proving such fact or facts shall be paid by the party so neglecting or refusing, whatever the result of the 
suit may be, unless the Court otherwise directs:  
Provided that any admission made in pursuance of such notice is to be deemed to be made only for 
the purposes of the particular suit, and not as an admission to be used against the party on any other 
occasion or in favour of any person other than the party giving the notice: 
5*  
 
        *  
                   * 
 
 
          *  
 
        *') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 5 — Form of admissions', 'Rule 5. Form of admissions
A notice to admit facts shall be in Form No. 10 in Appendix C, and admission of 
facts shall be in Form No. 11 in Appendix C, with such variations as circumstances may require.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 6 — Judgment on admissions', 'Rule 6. Judgment on admissions
(1) Where admissions of fact have been made either in the pleading 
or otherwise, whether orally or in writing, the Court may at any stage of the suit, either on the application 
of any party or of its own motion and without waiting for the determination of any other question-between 
the parties, make such order or give such judgment as it may think fit, having regard to such admissions. 
(2) Whenever a judgment is pronounced under sub-rule (1) a decree shall be drawn up in accordance 
with the judgment and the decree shall bear the date on which the judgment was pronounced.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 7 — Affidavit of signature', 'Rule 7. Affidavit of signature
An affidavit of the pleader or his clerk, of the due signature of any 
admissions made in pursuance of any notice to admit documents or facts, shall be sufficient evidenced of 
such admissions, if evidence thereof is required.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 8 — Notice to produce documents', 'Rule 8. Notice to produce documents
Notice to produce documents shall be in Form No. 12 in      
Appendix C, with such variations as circumstances may require. An affidavit of the pleader, or his clerk, of 
the service of any notice to produce, and of the time when it was served, with a copy of the notice to produce, 
shall in all cases be sufficient evidence of the service of the notice, and of the time when it was served.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XII/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XII', 'section', 'Rule 9 — Costs', 'Rule 9. Costs
If a notice to admit or produce specifies documents which are not necessary, the costs 
occasioned thereby shall be borne by the party giving such notice.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XIII — Production, Impounding and Return of Documents', 'ORDER XIII
PRODUCTION, IMPOUNDING AND RETURN OF DOCUMENTS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 1 — Original documents to be produced at or before the settlement of issues', 'Rule 1. Original documents to be produced at or before the settlement of issues
(1) The parties or 
their pleader shall produce on or before the settlement of issues, all the documentary evidence in original 
where the copies thereof have been filed along with plaint or written statement. 
(2) The Court shall receive the documents so produced: 
Provided that they are accompanied by an accurate list thereof prepared in such form as the High 
Court directs. 
(3) Nothing in sub-rule (1) shall apply to documents—  
(a) produced for the cross-examination of the witnesses of the other party; or 
(b) handed over to a witness merely to refresh his memory.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 2 — [Effect of non-production of documents.] Rep. by the Code of Civil Procedure (Amendment) Act, 1999 
(46 of 1999) s', 'Rule 2. [Effect of non-production of documents.] Rep. by the Code of Civil Procedure (Amendment) Act, 1999 
(46 of 1999) s
23 (w.e.f. 1-7-2002).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 3 — Rejection of irrelevant or inadmissible documents', 'Rule 3. Rejection of irrelevant or inadmissible documents
The Court may at any stage of the suit reject 
any document which it considers irrelevant or otherwise inadmissible, recording the grounds of such 
rejection.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 4 — Endorsements on documents admitted in evidence', 'Rule 4. Endorsements on documents admitted in evidence
(1) Subject to the provisions of the next 
following sub-rule, there shall be endorsed on every document which has been admitted in evidence in the 
suit the following particulars, namely:— 
(a) the number and title of the suit, 
(b) the name of the person producing the document, 
(c) the date on which it was produced, and 
(d) a statement of its having been so admitted, 
and the endorsement shall be signed or initialled by the Judge. 
(2) Where a document so admitted is an entry in a book, account or record, and a copy thereof has 
been substituted for the original under the next following rule, the particulars aforesaid shall be endorsed 
on the copy and the endorsement thereon shall be signed or initialled by the Judge.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 5 — Endorsements on copies of admitted entries in books, accounts and records', 'Rule 5. Endorsements on copies of admitted entries in books, accounts and records
(1) Save in so 
far as is otherwise provided by the Bankers’ Books Evidence Act, 1891 (XVIII of 1891) where a 
document admitted in evidence in the suit is an entry in a letter-book or a shop-book or other account in 
current use, the party on whose behalf the book or account is produced may furnish a copy of the entry. 
(2) Where such a document is an entry in a public record produced from a public office or by a public 
officer, or an entry in a book or account belonging to a person other than a party on whose behalf the 
book or account is produced, the Court may require a copy of the entry to be furnished— 
 

 
 
 
(a) where the record, book or account is produced on behalf of a party, then by that party, or 
(b) where the record, book or account is produced in obedience to an order of the Court acting of 
its own motion, then by either or any party. 
(3) Where a copy of an entry is furnished under the foregoing provisions of this rule, the Court shall, after 
causing the copy to be examined, compared and certified in manner mentioned in rule 17 of Order VII, mark 
the entry and cause the book, account or record in which it occurs to be returned to the person producing it.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 6 — Endorsements on documents rejected an inadmissible in evidence', 'Rule 6. Endorsements on documents rejected an inadmissible in evidence
Where a document relied 
on as evidence by either party is considered by the Court to be inadmissible in evidence, there shall be 
endorsed thereon the particulars mentioned in clauses (a), (b) and (c) of rule 4, sub-rule (1) together with 
a statement of its having been rejected, and the endorsement shall be signed or initialled by the Judge.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 7 — Recording of admitted and return of rejected documents', 'Rule 7. Recording of admitted and return of rejected documents
(1) Every documents which has 
been admitted in evidence, or a copy thereof where a copy has been substituted for the original under                
rule 5, shall form part of the record of the suit. 
(2) Documents not admitted in evidence shall not form part of the record and shall be returned to the 
persons respectively producing them.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 8 — Court may order any document to be impounded', 'Rule 8. Court may order any document to be impounded
Notwithstanding anything contained in                     
rule 5 or rule 7 of this Order or in rule 17 of Order VII, the Court may, if it sees sufficient cause, direct 
any document or book produced before it in any suit to be impounded and kept in the custody of an 
officer of the Court, for such period and subject to such conditions as the Court thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 9 — Return of admitted documents', 'Rule 9. Return of admitted documents
(1) Any person, whether a party to the suit or not, desirous of 
receiving back any documents produced by him in the suit and placed on the record shall, unless the 
document is impounded under rule 8, be entitled to receive back the same,—  
(a) where the suit is one in which an appeal is not allowed, when the suit has been disposed of, and 
(b) where the suit is one in which an appeal is allowed, when the Court is satisfied that the time 
for preferring an appeal has elapsed and that no appeal has been preferred or, if an appeal has been 
preferred, when the appeal has been disposed of: 
1[Provided that a document may be returned at any time earlier then that prescribed by this rule if the 
person applying therefor—  
(a) delivers to the proper officer for being substituted for the original,— 
(i) in the case of a party to the suit, a certified copy, and 
(ii) in the case of any other person, an ordinary copy which has been examined, compared and 
certified in the manner mentioned in sub-rule (2) of rule 17 of Order VII, and 
 (b) undertakes to produce the original, if required to do so:] 
Provided also that no document shall be returned which, by force of the decree, has become wholly 
void or useless. 
(2) On the return of a document admitted in evidence, a receipt shall be given by the person 
receiving it.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 10 — Court may send for papers from its own records or from other Courts', 'Rule 10. Court may send for papers from its own records or from other Courts
(1) The Court may 
of its own motion, and may in its discretion upon the application of any of the parties to a suit, send for, 
either from its own records or from any other Court, the record of any other suit or proceeding, and 
inspect the same. 
(2) Every application made under this rule shall (unless the Court otherwise directs) be supported 
by an affidavit showing how the record is material to the suit in which the application is made, and 
that the applicant cannot without unreasonable delay or expense obtain a duly authenticated copy of 
the record or of such portion thereof as the applicant requires, or that the production of the original is 
necessary for the purposes of justice. 
(3) Nothing contained in this rule shall be deemed to enable the Court to use in evidence any 
document which under the law of evidence would be inadmissible in the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII', 'section', 'Rule 11 — Provisions as to documents applied to material objects', 'Rule 11. Provisions as to documents applied to material objects
The provisions therein contained as 
to documents shall, so far as may be, apply to all other material objects producible as evidence.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII-A', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XIII-A — Summary Judgment', 'ORDER XIII-A
SUMMARY JUDGMENT') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII-A/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII-A', 'section', 'Rule 1 — Scope of and classes of suits to which this Order applies', 'Rule 1. Scope of and classes of suits to which this Order applies
(1) This Order sets out the procedure 
by which Courts may decide a claim pertaining to any Commercial Dispute without recording oral 
evidence. 
(2) For the purposes of this Order, the word “claim” shall include—  
(a) part of a claim;  
(b) any particular question on which the claim (whether in whole or in part) depends; or  
(c) a counter-claim, as the case may be.  
(3) Notwithstanding anything to the contrary, an application for summary judgment under this Order 
shall not be made in a suit in respect of any Commercial Dispute that is originally filed as a summary suit 
under Order XXXVII.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII-A/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII-A', 'section', 'Rule 2 — Stage for application for summary judgment', 'Rule 2. Stage for application for summary judgment
An applicant may apply for summary judgment 
at any time after summons has been served on the defendant:  
Provided that, no application for summary judgment may be made by such applicant after the Court 
has framed the issues in respect of the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII-A/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII-A', 'section', 'Rule 3 — Grounds for summary judgment', 'Rule 3. Grounds for summary judgment
The Court may give a summary judgment against a plaintiff 
or defendant on a claim if it considers that–– 
 (a) the plaintiff has no real prospect of succeeding on the claim or the defendant has no real 
prospect of successfully defending the claim, as the case may be; and  
(b) there is no other compelling reason why the claim should not be disposed of before recording 
of oral evidence.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII-A/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII-A', 'section', 'Rule 4 — Procedure', 'Rule 4. Procedure
(1) An application for summary judgment to a Court shall, in addition to any other 
matters the applicant may deem relevant, include the matters set forth in sub-rules (a) to (f) mentioned 
hereunder:—  
(a) the application must contain a statement that it is an application for summary judgment made 
under this Order; 
(b) the application must precisely disclose all material facts and identify the point of law, if any; 
(c) in the event the applicant seeks to rely upon any documentary evidence, the applicant must,––  
(i) include such documentary evidence in its application, and  
(ii) identify the relevant content of such documentary evidence on which the applicant relies;  
(d) the application must state the reason why there are no real prospects of succeeding on the 
claim or defending the claim, as the case may be;  
(e) the application must state what relief the applicant is seeking and briefly state the grounds for 
seeking such relief. 
(2) Where a hearing for summary judgment is fixed, the respondent must be given at least thirty days’ 
notice of:—  
(a) the date fixed for the hearing; and  
(b) the claim that is proposed to be decided by the Court at such hearing. 
(3) The respondent may, within thirty days of the receipt of notice of application of summary 
judgment or notice of hearing (whichever is earlier), file a reply addressing the matters set forth in                
clauses (a) to (f) mentioned hereunder in addition to any other matters that the respondent may deem 
relevant:—  
(a) the reply must precisely–– 
(i) disclose all material facts; 
(ii) identify the point of law, if any; and 
(iii) state the reasons why the relief sought by the applicant should not be granted;  
 
* Ins. by Act 4 of 2016, s. 16 and Sch., Shall be applicable to commercial disputes of a specified value (w.e.f. 23-10-2015). 

 
 
 
(b) in the event the respondent seeks to rely upon any documentary evidence in its reply, the 
respondent must—  
(i) include such documentary evidence in its reply; and  
(ii) identify the relevant content of such documentary evidence on which the respondent 
relies;  
(c) the reply must state the reason why there are real prospects of succeeding on the claim or 
defending the claim, as the case may be;  
(d) the reply must concisely state the issues that should be framed for trial;  
(e) the reply must identify what further evidence shall be brought on record at trial that could not 
be brought on record at the stage of summary judgment; and  
(f) the reply must state why, in light of the evidence or material on record if any, the Court should 
not proceed to summary judgment.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII-A/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII-A', 'section', 'Rule 5 — Evidence for hearing of summary judgment', 'Rule 5. Evidence for hearing of summary judgment
(1) Notwithstanding anything in this Order, if the 
respondent in an application for summary judgment wishes to rely on additional documentary evidence 
during the hearing, the respondent must:—  
(a) file such documentary evidence; and  
(b) serve copies of such documentary evidence on every other party to the application at least 
fifteen days prior to the date of the hearing.  
(2) Notwithstanding anything in this Order, if the applicant for summary judgment wishes to rely on 
documentary evidence in reply to the defendant’s documentary evidence, the applicant must:— 
(a) file such documentary evidence in reply; and  
(b) serve a copy of such documentary evidence on the respondent at least five days prior to the 
date of the hearing.  
(3) Notwithstanding anything to the contrary, sub-rules (1) and (2) shall not require documentary 
evidence to be:—  
(a) filed if such documentary evidence has already been filed; or  
(b) served on a party on whom it has already been served.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII-A/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII-A', 'section', 'Rule 6 — Orders that may be made by Court', 'Rule 6. Orders that may be made by Court
(1) On an application made under this Order, the Court 
may make such orders that it may deem fit in its discretion including the following:— 
(a) judgment on the claim;  
(b) conditional order in accordance with Rule 7 mentioned hereunder;  
(c) dismissing the application;  
(d) dismissing part of the claim and a judgment on part of the claim that is not dismissed;  
(e) striking out the pleadings (whether in whole or in part); or 
(f) further directions to proceed for case management under Order XV-A.  
(2) Where the Court makes any of the orders as set forth in sub-rule (1)(a) to (f), the Court shall 
record its reasons for making such order.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII-A/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII-A', 'section', 'Rule 7 — Conditional order', 'Rule 7. Conditional order
(1) Where it appears to the Court that it is possible that a claim or defence 
may succeed but it is improbable that it shall do so, the Court may make a conditional order as set forth in 
Rule 6 (1)(b). 
(2) Where the Court makes a conditional order, it may:—  
(a) make it subject to all or any of the following conditions:—  
(i) require a party to deposit a sum of money in the Court; 
(ii) require a party to take a specified step in relation to the claim or defence, as the case may 
be; 
(iii) require a party, as the case may be, to give such security or provide such surety for 
restitution of costs as the Court deems fit and proper; 

 
 
 
(iv) impose such other conditions, including providing security for restitution of losses that 
any party is likely to suffer during the pendency of the suit, as the Court may deem fit in its 
discretion; and  
(b) specify the consequences of the failure to comply with the conditional order, including 
passing a judgment against the party that have not complied with the conditional order.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIII-A/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIII-A', 'section', 'Rule 8 — Power to impose costs', 'Rule 8. Power to impose costs
The Court may make an order for payment of costs in an application for 
summary judgment in accordance with the provisions of sections 35 and 35A of the Code.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIV', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XIV — Settlement of Issues and Determination of Suit on', 'ORDER XIV
SETTLEMENT OF ISSUES AND DETERMINATION OF SUIT ON') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIV/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIV', 'section', 'Rule 1 — Framing of issues', 'Rule 1. Framing of issues
(1) Issues arise when a material proposition of fact or law is affirmed by the 
one party and denied by the other. 
(2) Material propositions arc those propositions of law or fact which a plaintiff must allege in order to 
show a right to sue or a defendant must allege in order to constitute his defence. 
(3) Each material proposition affirmed by one party and denied by the other shall form the subject of 
distinct issue. 
(4) Issues are of two kinds: 
(a) issues of fact, 
(b) issues of law. 
(5) At the first hearing of the suit the Court shall, after reading the plaint and the written statements if 
any, and 1[after examination under rule 2 of Order X and after hearing the parties or their pleaders], 
ascertain upon what material propositions of fact or of law the parties are at variance, and shall thereupon 
proceed to frame and record the issues on which the right decision of the case appears to depend. 
(6) Nothing is this rule requires the Court to frame and record issued where the defendant at the first 
hearing of the suit makes no defence.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIV/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIV', 'section', 'Rule 2 — Court to pronounce judgment on all issues', 'Rule 2. Court to pronounce judgment on all issues
(1) Notwithstanding that a case may be disposed 
of on a preliminary issue, the Court shall, subject to the provisions of sub-rule (2), pronounce judgment 
on all issues. 
(2) Where issues both of law and of fact arise in the same suit, and the Court is of opinion that the case or 
any part thereof may be disposed of on an issue of law only, it may try that issue first if the issue relates to— 
(a) the jurisdiction of the Court, or 
(b) a bar to the suit created by any law for the time being in force, 
and for that purpose may, if it thinks fit, postpone the settlement of the other issues until after that issue 
has been determined, and may deal with the suit in accordance with the decision on that issue.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIV/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIV', 'section', 'Rule 3 — Materials from which issues may be framed', 'Rule 3. Materials from which issues may be framed
The Court may frame the issues from all or any 
of the following materials:— 
(a) allegations made on oath by the parties, or by any persons present on their behalf, or made by 
the pleaders of such parties; 
(b) allegations made in the pleadings or in answers to interrogatories delivered in the suit; 
(c) the contents of documents produced by either party.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIV/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIV', 'section', 'Rule 4 — Court may examine witnesses or documents before framing issues', 'Rule 4. Court may examine witnesses or documents before framing issues
Where the Court is of 
opinion that the issues cannot be correctly framed without the examination of some person not before the 
Court or without the inspection of some document not, produced in the suit, it 3[may adjourn the framing 
of issues to a day not later than seven days] and may (subject to any law for the time being in force) 
compel the attendance of any person or the production of any document by the person in whose 
possession or power it is by summons or other process.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIV/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIV', 'section', 'Rule 5 — Power to amend and strike out, issues', 'Rule 5. Power to amend and strike out, issues
(1) The Court may at any time before passing a decree 
amend the issues or frame additional issues on such terms as it thinks fit, and all such amendments or 
additional issues as may be necessary for determining the matters in controversy between the parties shall 
be so made or framed. 
(2) The Court may also, at any time before passing a decree, strike out any issues that appear to it to 
be wrongly framed or introduced.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIV/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIV', 'section', 'Rule 6 — Questions of fact or law may by agreement be stated in form of issues', 'Rule 6. Questions of fact or law may by agreement be stated in form of issues
(1) Where the parties 
to a suit are agreed as to the question of fact or of law to be decided between them, they may state the 
same in the form of an issue, and enter into an agreement in writing that, upon the finding of the Court in 
the affirmative or the negative or such issue,— 
(a) a sum of money specified in the agreement or to be ascertained by the Court, or in such 
manner as the Court may direct, shall be paid by one of the parties to the other of them, or that one of 
them be declared entitled to some right or subject some liability specified in the agreement; 
(b) some property specified in the agreement and in dispute in the suit shall be delivered by one 
of the parties to the other of them, or as that other may direct; or 
(c) one or more of the parties shall do or abstain from doing some particular act specified in the 
agreement and relating to the matter in dispute.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIV/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIV', 'section', 'Rule 7 — Court, if satisfied that agreement was executed in good faith, may pronounce judgment', 'Rule 7. Court, if satisfied that agreement was executed in good faith, may pronounce judgment
Where the Court is satisfied, after making such inquiry as it deems proper,—  
(a) that the agreement was duly executed by the parties, 
(b) that they have a substantial interest in the decision of such question as aforesaid, and 
(c) that the same is fit to be tried and decided, 
it shall proceed to record and try the issue and state its finding or decision thereon in the same manner as 
if the issue had been framed by the Court; 
and shall, upon the finding or decision on such issue, pronounce judgment according to the terms of 
the agreement; and, upon the judgment so pronounced, a decree shall follow.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XV — Disposal of the Suit at the first hearing', 'ORDER XV
DISPOSAL OF THE SUIT AT THE FIRST HEARING') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV', 'section', 'Rule 1 — Parties not at issue', 'Rule 1. Parties not at issue
(1) Where at the first hearing of a suit it appears that the parties are not at 
issue on any question of law or of fact, the Court may at once pronounce judgment.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV', 'section', 'Rule 2 — One of several defendants not at issue', 'Rule 2. One of several defendants not at issue
2[(1) Where there are more defendants than one, and any 
one of the defendants is not at issue with the plaintiff on any question of law or of fact, the Court may at once 
pronounce judgment for or against such defendant and the suit shall proceed only against the other 
defendants.] 
3[(2) Whenever a judgment is pronounced under this rule, decree shall be drawn up in accordance with 
such judgment and the decree shall bear the date on which the judgment was pronounced.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV', 'section', 'Rule 3 — Parties at issue', 'Rule 3. Parties at issue
(1) Where the parties are at issue on some question of law or of fact, and issues 
have been framed by the Court as hereinbefore provided, if the Court is satisfied that no further argument 
or evidence that the parties can at once adduce is required upon such of the issues as may be sufficient for 
the decision of the suit, and that no injustice will result from proceeding with the suit forthwith, the Court 
may proceed to determine such issues, and, if the finding thereon is sufficient for the decision, may') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV', 'section', 'Rule 4 — Failure to produce evidence', 'Rule 4. Failure to produce evidence
Where the summons has been issued for the final disposal of the 
suit and either party fails without sufficient cause to produce the evidence on which he relies, the Court 
may at once pronounce judgment, or may, if it thinks fit, after framing and recording issues, adjourn the 
suit for the production of such evidence as may be necessary for its decision upon such issues.] 
Uttar Pradesh 
Amendment of Order XV.— In the First Schedule, in Order XV, for the existing rule 5, the following 
rule shall be substituted, namely :— 
“5. Striking off defense on failure to deposit admitted rent, etc.— (1) In any suit by a 
lessor for the eviction of a lessee after the determination of his lease and for the recovery from 
him of rent or compensation for use and occupation, the defendant shall, at  or  before the first 
hearing of the suit, deposit the entire amount admitted by him to be due  together with 
interest thereon at the rate  of nine per centum per annum and whether or not he admits  any  
amount  to  be  due,  he shall throughout the continuation of the suit regularly deposit  the 
monthly amount due  within a  week from the date of its accrual,  and in the event of any default 
in making the deposit of the entire amount admitted by him to be  due  or  the  monthly  amount  
due  as  aforesaid, the court may subject to the provisions of sub-rule (2), strike off his defense. 
“Explanation 1  —  The  expression  ‘first  hearing’  means  the date for filing written 
statement or for hearing mentioned in the summons or where more than one of such dates 
are  mentioned, the last of the dated mentioned. 
“Explanation 2 — The expression ‘entire amount admitted by him to be due’ means 
the entire gross amount, whether as rent or compensation for use and occupation, 
calculated at the admitted rate of rent for the admitted period of arrears after making no 
other deduction except the taxes, if any, paid to a local authority in respect of the building 
on lessor’s account and the amount, if any, deposited in any court under section 30 of the U. 
P. Urban Buildings (Regulation of Letting, Rent and Eviction) Act, 1972. 
“Explanation  3  —  The  expression  ‘monthly  amount  due’ means the amount due  
every month,  whether as  rent or compensation for use and occupation at the admitted rate of  
rent,  after  making  no other deductions except the taxes, if any, paid to a local authority in 
respect of the building on lessor’s account. 
(2) Before making an order for striking  off  defense,  the  court may consider any 
representation made by the defendant in that behalf provided such representation is made within  10  
days,  of  the  first hearing or, of  the  expiry  of the  week referred to in sub-section (1),  as the case 
may be. 
(3) The amount deposited under this rule may at any time be withdrawn by the plaintiff ; 
Provided that such withdrawal shall not have the effect of prejudicing any claim by the 
plaintiff disputing the correctness of the amount deposited ; 
Provided further that  if  the  amount  deposited  includes  any sums claimed by the 
depositor to be deductible  on  any  account,  the court may  require  the  plaintiff  to  furnish 
security for such sum before he is allowed to withdraw the same.” 
[Vide Uttar Pradesh Act 57 of 1976, s. 7] 
 

 
 
 
Uttar Pradesh 
Insertion of new rule in Order XV Schedule 1 of 1908.-- In the First Schedule to the said Code, 
in Order XV, after rule 4, the following rule shall be inserted, namely ; 
“5. Striking off defense on non-deposit of admitted rent, etc.--(1) In any suit by a 
lessor for the eviction of a lessee from any immovable property after the  
determination  of  his  lease,  and  for the recovery from him of rent in respect of the 
period of occupation thereof during the continuance of the  lease, or of  compensation 
for the use or occupation thereof, whether instituted before or after the commencement 
of the  Uttar Pradesh Civil Laws Amendment Act, 1972, the defendant shall, at or before  
the  first hearing  of the suit (or in the case of a suit instituted before the commencement 
of  the said  Act,  the first hearing after such commencement), deposit the entire  amount 
of rent, or compensation for use and occupation, admitted  by  him  to  be due, and 
thereafter throughout the continuance of the suit, deposit regularly the amount of 
monthly rent, or compensation for use and occupation, due at the rate admitted by him, 
and in the event of  any default in this regard, the Court may, unless after considering 
any representation made by him in  that  behalf  it  allows  him  further  time on security 
being furnished for the amount, refuse to entertain any defense or, as the case may be, 
strike-off his defense. 
(2) The provisions of this rule are in addition to and not in derogation of anything 
contained in rule 10 of Order XXXIX.” 
[Vide Uttar Pradesh Act 37 of 1972, s. 7]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV-A', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XV-A — Case Management Hearing', 'ORDER XV-A
CASE MANAGEMENT HEARING') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV-A/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV-A', 'section', 'Rule 1 — First Case Management Hearing', 'Rule 1. First Case Management Hearing
The Court shall hold the first Case Management Hearing, not 
later than four weeks from the date of filing of affidavit of admission or denial of documents by all parties 
to the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV-A/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV-A', 'section', 'Rule 2 — Orders to be passed in a Case Management Hearing', 'Rule 2. Orders to be passed in a Case Management Hearing
In a Case Management Hearing, after 
hearing the parties, and once it finds that there are issues of fact and law which require to be tried, the 
Court may pass an order–– 
(a) framing the issues between the parties in accordance with Order XIV of the Code of Civil 
Procedure, 1908  (5 of 1908), after examining pleadings, documents and documents produced before 
it, and on examination conducted by the Court under Rule 2 of Order X, if required; 
(b) listing witnesses to be examined by the parties;  
(c) fixing the date by which affidavit of evidence to be filed by parties; 
(d) fixing the date on which evidence of the witnesses of the parties to be recorded;  
(e) fixing the date by which written arguments are to be filed before the Court by the parties;  
(f) fixing the date on which oral arguments are to be heard by the Court; and  
(g) setting time limits for parties and their advocates to address oral arguments.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV-A/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV-A', 'section', 'Rule 3 — Time limit for the completion of a trial', 'Rule 3. Time limit for the completion of a trial
In fixing dates or setting time limits for the purposes of 
Rule 2 of this Order, the Court shall ensure that the arguments are closed not later than six months from 
the date of the first Case Management Hearing. 
 
 
 
 
     * Ins. by Act 4 of 2016, s. 16 and Sch., Shall be applicable to commercial disputes of a specified value (w.e.f. 23-10-2015).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV-A/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV-A', 'section', 'Rule 4 — Recording of oral evidence on a day-to-day basis', 'Rule 4. Recording of oral evidence on a day-to-day basis
The Court shall, as far as possible, ensure 
that the recording of evidence shall be carried on, on a day-to-day basis until the cross-examination of all 
the witnesses is complete.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV-A/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV-A', 'section', 'Rule 5 — Case Management Hearings during a trial', 'Rule 5. Case Management Hearings during a trial
The Court may, if necessary, also hold Case 
Management Hearings anytime during the trial to issue appropriate orders so as to ensure adherence by 
the parties to the dates fixed under Rule 2 and facilitate speedy disposal of the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV-A/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV-A', 'section', 'Rule 6 — Powers of the Court in a Case Management Hearing', 'Rule 6. Powers of the Court in a Case Management Hearing
(1) In any Case Management Hearing 
held under this Order, the Court shall have the power to—  
(a) prior to the framing of issues, hear and decide any pending application filed by the parties 
under Order XIII-A; 
(b) direct parties to file compilations of documents or pleadings relevant and necessary for 
framing issues; 
(c) extend or shorten the time for compliance with any practice, direction or Court order if it finds 
sufficient reason to do so;  
(d) adjourn or bring forward a hearing if it finds sufficient reason to do so; 
(e) direct a party to attend the Court for the purposes of examination under Rule 2 of Order X;  
(f) consolidate proceedings;  
(g) strike off the name of any witness or evidence that it deems irrelevant to the issues framed;  
(h) direct a separate trial of any issue;  
(i) decide the order in which issues are to be tried;  
(j) exclude an issue from consideration; 
(k) dismiss or give judgment on a claim after a decision on a preliminary issue;  
(l) direct that evidence be recorded by a Commission where necessary in accordance with                     
Order XXVI;  
(m) reject any affidavit of evidence filed by the parties for containing irrelevant, inadmissible or 
argumentative material;  
(n) strike off any parts of the affidavit of evidence filed by the parties containing irrelevant, 
inadmissible or argumentative material;  
(o) delegate the recording of evidence to such authority appointed by the Court for this purpose;  
(p) pass any order relating to the monitoring of recording the evidence by a commission or any 
other authority; 
(q) order any party to file and exchange a costs budget; 
(r) issue directions or pass any order for the purpose of managing the case and furthering the 
overriding objective of ensuring the efficient disposal of the suit. 
(2) When the Court passes an order in exercise of its powers under this Order, it may—  
(a) make it subject to conditions, including a condition to pay a sum of money into Court; and 
 (b) specify the consequence of failure to comply with the order or a condition.  
(3) While fixing the date for a Case Management Hearing, the Court may direct that the parties also 
be present for such Case Management Hearing, if it is of the view that there is a possibility of settlement 
between the parties.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV-A/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV-A', 'section', 'Rule 7 — Adjournment of Case Management Hearing', 'Rule 7. Adjournment of Case Management Hearing
(1) The Court shall not adjourn the Case 
Management Hearing for the sole reason that the advocate appearing on behalf of a party is not present:  
Provided that an adjournment of the hearing is sought in advance by moving an application, the Court 
may adjourn the hearing to another date upon the payment of such costs as the Court deems fit, by the 
party moving such application.  
(2) Notwithstanding anything contained in this Rule, if the Court is satisfied that there is a justified 
reason for the absence of the advocate, it may adjourn the hearing to another date upon such terms and 
conditions it deems fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XV-A/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XV-A', 'section', 'Rule 8 — Consequences of non-compliance with orders', 'Rule 8. Consequences of non-compliance with orders
Where any party fails to comply with the order 
of the Court passed in a Case Management Hearing, the Court shall have the power to—  
 
(a) condone such non-compliance by payment of costs to the Court;  
 (b) foreclose the non-compliant party’s right to file affidavits, conduct cross-examination of 
witnesses, file written submissions, address oral arguments or make further arguments in the trial, as 
the case may be, or  
 (c) dismiss the plaint or allow the suit where such non-compliance is wilful, repeated and the 
imposition of costs is not adequate to ensure compliance.] 
Jammu and Kashmir and Ladakh (UTs).― 
Insertion of Order XV-A.—After Order XV of the Code, insert the following Order, namely,- 
 
“ORDER XV-A') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XVI — Summoning and Attendance of Witnesses', 'ORDER XVI
SUMMONING AND ATTENDANCE OF WITNESSES') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 1 — List of witnesses and summons to witnesses', 'Rule 1. List of witnesses and summons to witnesses
(1) On or before such date as the Court may 
appoint, and not later than fifteen days after the date on which the issues are settled, the parties shall 
present in Court a list of witnesses whom they propose to call either to give evidence or to produce 
documents and obtain summonses to such persons for their attendance in Court. 
(2) A party desirous of obtaining any summons for the attendance of any person shall file in Court an 
application stating therein the purpose for which the witness is proposed to be summoned. 
(3) The Court may, for reasons to be recorded, permit a party to call, whether by summoning through 
Court or otherwise, any witness, other than those whose names appear in the list referred to in sub-rule (1), 
if such party shows sufficient cause for the omission to mention the name of such witness in the said list. 
(4) Subject to the provisions of sub-rule (2), summonses referred to in this rule may be obtained by 
the parties on an application to the Court or to such officer as may be appointed by the 2[Court in this 
behalf within five days of presenting the list of witnesses under sub-rule (1).]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-1A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 1A — Production of witnesses without summons', 'Rule 1A. Production of witnesses without summons
A Subject to the provisions of sub-rule (3) of 
rule 1, any party to the suit may, without applying for summons under rule 1, bring any witness to give 
evidence or to produce documents.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 2 — Expenses of witness to be paid into Court on applying for summons', 'Rule 2. Expenses of witness to be paid into Court on applying for summons
(1) The party applying for 
a summons shall, before the summons is granted and within a period to be fixed 4[which shall not be later 
than seven days from the date of making applications under sub-rule (4) of rule 1] pay into Court such a sum 
of money as appears to the Court to be sufficient to defray the travelling and other expenses of the person 
summoned in passing to and from the Court in which he is required to attend, and for one day’s attendance. 
(2) Experts.—In determining the amount payable under this rule, the Court may, in the case of any 
person summoned to give evidence as an expert, allow reasonable remuneration for the time occupied 
both in giving evidence and in performing any work of an expert character necessary for the case. 
(3) Scale of expenses.—Where the Court is subordinate to a High Court, regard shall be had, in 
fixing the scale of such expenses, to any rules made in that behalf. 
5[(4) Expenses to be directly paid to witnesses.—Where the summons is served directly by the party on 
a witness, the expenses referred to in sub-rule (1) shall be paid to the witness by the party or his agent.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 3 — Tender of expenses to witness', 'Rule 3. Tender of expenses to witness
The sum so paid into Court shall be tendered to the person    
summoned, at the time of serving the summons, if it can be served personally.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 4 — Procedure where insufficient sum paid in', 'Rule 4. Procedure where insufficient sum paid in
(1) Where it appears to the Court or to such officer as 
it appoints in this behalf that the sum paid into Court is not sufficient to cover such expenses or reasonable 
remuneration, the Court may direct such further sum to be paid to the person summoned as appears to be 
necessary on that account, and, in case of default in payment, may order such sum to be levied by 
attachment and sale of the movable property of the party obtaining the summons; or the Court may 
discharge the person summoned without requiring him to give evidence; or may both order such levy and 
discharge such person as aforesaid. 
 

 
 
 
 
(2) Expenses of witnesses detained more than one day.—Where it is necessary to detain the person 
summoned for a longer period than one day, the Court may, from time to time, order the party at whose 
instance he was summoned to pay into Court such sum as is sufficient to defray the expenses of his detention 
for such further period, and, in default of such deposit being made, may order such sum to be levied by 
attachment and sale of the movable property of such party; or the Court may discharge the person summoned 
without requiring him to give evidence; or may both order such levy and discharge such person as aforesaid.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 5 — Time, place and purpose of attendance to be specified in summons', 'Rule 5. Time, place and purpose of attendance to be specified in summons
Every summons for the 
attendance of a person to give evidence or to produce a document shall specify the time and place at 
which he is required to attend, and also whether his attendance is required for the purpose of giving 
evidence or to produce a document, or for both purposes; and any particular document, which the person 
summoned is called on to produce, shall be described in the summons with reasonable accuracy.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 6 — Summons to produce document', 'Rule 6. Summons to produce document
Any person may be summoned to produce a document, 
without being summoned to give evidence; and any person summoned merely to produce a document 
shall be deemed to have complied with the summons if he causes such document to be produced instead 
of attending personally to produce the same.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 7 — Power to require persons present in Court to give evidence or produce document', 'Rule 7. Power to require persons present in Court to give evidence or produce document
Any 
person present in Court may be required by the Court to give evidence or to produce any document then 
and there in his possession or power.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-7A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 7A — Summons given to the party for service', 'Rule 7A. Summons given to the party for service
(1) The Court may, on the application of any party 
for the issue of a summons for the attendance of any person, permit such party to effect service of such 
summons on such person and shall, in such a case, deliver the summons to such party for service. 
(2) The service of such summons shall be effected by or on behalf of such party by delivering or 
tendering to the witness personally a copy thereof signed by the Judge or such officer of the Court as he 
may appoint in this behalf and sealed with the seal of the Court. 
(3) The provisions of rules 16 and 18 of Order V shall apply to a summons personally served under 
this rule as if the person effecting service were a serving officer. 
(4) If such summons, when tendered, is refused or if the person served refuses to sign and 
acknowledgement of service or for any reason such summons cannot be served personally, the Court 
shall, on the application of the party, re-issue such summons to be served by the Court in the same 
manner as a summons to a defendant. 
(5) Where a summons is served by a party under this rule, the party shall not be required to pay the 
fees otherwise chargeable for the service of summons.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 8 — Summons how served', 'Rule 8. Summons how served
Every summons 2[under this Order, not being a summons delivered to a 
party for service under rule 7A,] shall be served as nearly as may be in the same manner as a summons to 
a defendant, and the rules in Order V as to proof of service shall apply in the case of all summonses 
served under this rule.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 9 — Time for serving summons', 'Rule 9. Time for serving summons
Service shall in all cases be made a sufficient time before the time 
specified in the summons for the attendance of the person summoned, to allow him a reasonable time for 
preparation and for travelling to the place .at which his attendance is required.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 10 — Procedure where witness fails to comply with summons', 'Rule 10. Procedure where witness fails to comply with summons
1[(1) Where a person to whom a summons has 
been issued either to attend to give evidence or to produce a document, fails to attend or to produce the document in 
compliance with such summons, the Court— 
(a) shall, if the certificate of the serving officer has not been verified by the affidavit, or if service of the 
summons has affected by a party or his agent, or 
(b) may, if the certificate of the serving officer has been so verified, 
examine on oath the serving officer or the party or his agent, as the case may be, who has effected service, or cause 
him to be so examined by any Court, touching the service or non-service of the summons.] 
(2) Where the Court sees reason to believe that such evidence or production is material, and that such person has, 
without lawful excuse, failed to attend or to produce the document in compliance with such summons or has 
intentionally avoided service, it may issue a proclamation requiring him to attend to give evidence or to produce the 
document at a time and place to be named therein; and a copy of such proclamation shall be affixed on the outer door or 
other conspicuous part of the house in which he ordinarily resides. 
(3) In lieu of or at the time of issuing such proclamation, or at any time afterwards, the Court may, in its 
discretion, issue a warrant, either with or without bail, for the arrest of such person, and may make an order for the 
attachment of his property to such amount as it thinks fit, not exceeding the amount of the costs of attachment and of 
any fine which may be imposed under rule 12: 
Provided that no Court of Small Causes shall make an order for the attachment of immovable property.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 11 — If witness appears, attachment may be withdrawn', 'Rule 11. If witness appears, attachment may be withdrawn
Where, at any time after the attachment of his 
property, such person appears and satisfies the Court,— 
(a) that he did not, without lawful excuse, fail to comply with the summons or intentionally avoid service, 
and 
(b) where he has failed to attend at the time and place named in a proclamation issued under the last 
preceding rule, that he had no notice of such proclamation in time to attend, 
the Court shall direct that the property be released from attachment, and shall make such order as to the costs of the 
attachment as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 12 — Procedure if witness fails to appear', 'Rule 12. Procedure if witness fails to appear
2[(1)] The Court may, where such person does not appear, or appears 
but fails so to satisfy the Court, impose upon him such fine not exceeding five hundred rupees as it thinks fit, having 
regard to his condition in life and all the circumstances of the case, and may order his property, or any part thereof, to 
be attached and sold or, if already attached under rule 10, to be sold for the purpose of satisfying all costs of such 
attachment, together with the amount of the said fine, if any: 
Provided that, if the person whose attendance is required pays into Court the costs and fine aforesaid, the Court 
shall order the property to be released from attachment. 
3[(2) Notwithstanding that the Court has not issued a proclamation under sub-rule (2) of rule 10, nor issued a 
warrant nor ordered attachment under sub-rule (3) of that rule, the Court may impose fine under sub-rule (1) of this 
rule after giving notice to such person to show cause why the fine should not be imposed.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 13 — Mode of attachment', 'Rule 13. Mode of attachment
The provisions with regard to the attachment and sale of property in the execution 
of a decree shall, so far as they are applicable, be deemed to apply to any attachment and sale under this Order as if 
the person whose property is so attached were a judgment-debtor.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-14', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 14 — Court may of its own accord summon as witnesses strangers to suit', 'Rule 14. Court may of its own accord summon as witnesses strangers to suit
Subject to the provisions of this 
Code as to attendance and appearance and to any law for the time being in force, where the Court at any time 
thinks it necessary 1[to examine any person, including a party to the suit] and not called as a witness by a 
party to the suit, the Court may, of its own motion, cause such person to be summoned as a witness to 
give evidence, or to produce any document in his possession, on a day to be appointed, and may examine 
him as a witness or require him to produce such document.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-15', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 15 — Duty of persons summoned to give evidence or produce document', 'Rule 15. Duty of persons summoned to give evidence or produce document
Subject as last aforesaid, 
whoever is summoned to appear and give evidence in a suit shall attend at the time and place named in 
the summons for that purpose, and whoever is summoned to produce a document shall either attend to 
produce it, or cause it to be produced, at such time and place.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-16', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 16 — When they may depart', 'Rule 16. When they may depart
(1) A person so summoned and attending shall, unless the Court             
otherwise directs, attend at each hearing until the suit has been disposed of. 
(2) On the application of either party and the payment through the Court of all necessary expenses    
(if any), the Court may require any person so summoned and attending to furnish security to attend at the 
next or any other hearing or until the suit is disposed of and, in default of his furnishing such security, 
may order him to be detained in the civil prison.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-17', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 17 — Application of rules 10 to 13', 'Rule 17. Application of rules 10 to 13
The provisions of rules 10 to 13 shall, so far as they are 
applicable, be deemed to apply to any person who having attended in compliance with a summons 
departs, without lawful excuse, in contravention of rule 16.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-18', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 18 — Procedure where witness apprehended cannot give evidence or produce document', 'Rule 18. Procedure where witness apprehended cannot give evidence or produce document
Where 
any person arrested under a warrant is brought before the Court in custody and cannot, owing to the 
absence of the parties or any of them, give the evidence or produce the document which he has been 
summoned to give or produce, the court may require him to give reasonable bail or other security for his 
appearance at such time and place as it thinks fit, and, on such bail or security being given, may release 
him, and, in default of his giving such bail or security, may order him to be detained in the civil prison.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-19', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 19 — No witness to be ordered to attend in person unless resident within certain limits', 'Rule 19. No witness to be ordered to attend in person unless resident within certain limits
No one 
shall be ordered to attend in person to give evidence unless he resides— 
(a) within the local limits of the Court’s ordinary jurisdiction, or 
(b) without such limits but at a place less then 2[one hundred] or (where there is railway or steamer 
communication or other established public conveyance for five-sixths of the distance between the place 
where he resides and the place where the Court is situate) less than 3[five hundred kilometres] distance 
from the court-house: 
4[Provided that where transport by air is available between the two places mentioned in this rule and 
the witness is paid the fare by air, he may be ordered to attend in person.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-20', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 20 — Consequence of refusal of party to give evidence when called on by Court', 'Rule 20. Consequence of refusal of party to give evidence when called on by Court
Where any party 
to a suit present in Court refuses, without lawful excuse, when required by the Court, to give evidence or 
to produce any document then and there in his possession or power, the Court may pronounce judgment 
against him or make such order in relation to the suit as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI/R-21', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI', 'section', 'Rule 21 — Rules as to witnesses to apply to parties summoned', 'Rule 21. Rules as to witnesses to apply to parties summoned
Where any party to a suit is required to 
give evidence or to produce a document, the provisions as to witnesses shall apply to him so far as they 
are applicable. 
 
 

 
 
 
Uttar Pradesh 
Amendment of Order XVI.— In the First Schedule, in Order XVI — 
(a) in rule 2, —] 
(i) in sub-rule  (1)  at  the  end,  the  following  proviso  shall  be  inserted, namely :— 
“Provided, where Government is the party applying for  a summons to a Government servant, it 
shall not be necessary  for it  to make any such payment into court.” ; 
(ii) sub-rule (4)  as  inserted  by  the  Allahabad  High  Court  shall be omitted and after sub-rule (4) as 
inserted by the Code of  Civil Procedure (Amendment) Act, 1976, the following sub-rule shall be inserted, 
namely :— 
“(4-A) Allowances, etc. of, Government servant witnesses to be taxed as costs— Any travelling 
and daily allowances and the salary, payable to a Government servant who attends the Court to give 
evidence or to produce a document shall, on the amount being certified by such witness be taxable 
as costs. 
“Explanation 1  —  The  travelling  and daily  allowances shall be in accordance with the rules  
governing  such allowances,  applicable  to the Government servant in question. 
“Explanation 2 — The daily allowance and salary of the Government servant shall be  proportionate  
to  the  number  of  days  of his attendance required by the Court.” ; 
(b) in rule 4, the following proviso shall be inserted, namely :— 
“Provided that nothing in this  rule  shall apply  to  a case  where the witness is a Government 
servant summoned at the instance of Government as a party.” 
[Vide Uttar Pradesh Act 57 of 1976, s. 8]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI A', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XVI A — Attendance of witnesses confined or detained in prisons', 'ORDER XVI A
ATTENDANCE OF WITNESSES CONFINED OR DETAINED IN PRISONS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI A/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI A', 'section', 'Rule 1 — Definitions', 'Rule 1. Definitions
In this Order,— 
(a) “detained” includes detained under any law providing for preventive detention; 
(b) “prison” includes— 
(i) any place which has been declared by the State Government, by general or special order, 
to be a subsidiary jail; and 
(ii) any reformatory, borstal institution or other institution of a like nature.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI A/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI A', 'section', 'Rule 2 — Power to require attendance of prisoners to give evidence', 'Rule 2. Power to require attendance of prisoners to give evidence
Where it appears to a Court that 
the evidence of a person confined or detained in a prison within the State is material in a suit, the Court 
may make an order requiring the officer in charge of the prison to produce that person before the Court to 
give evidence: 
Provided that, if the distance from the prison to the Court-house is more than twenty-five kilometers, 
no such order shall be made unless the Court is satisfied that the examination of such person on 
commission will not be adequate.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI A/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI A', 'section', 'Rule 3 — Expenses to be paid into Court', 'Rule 3. Expenses to be paid into Court
(1) Before making any order under rule 2, the Court shall 
require the party at whose instance or for whose benefit the order is to be issued, to pay into Court such 
sum of money as appears to the Court to be sufficient to defray the expenses of the execution of the order, 
including the travelling and other expenses of the escort provided for the witness. 
(2) Where the Court is subordinate to a High Court, regard shall be had, in fixing the scale of such 
expenses, to any rules made by the High Court in that behalf.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI A/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI A', 'section', 'Rule 4 — Power of State Government to exclude certain persons from the operation of rule 2', 'Rule 4. Power of State Government to exclude certain persons from the operation of rule 2
(1) The 
State Government may, at any time, having regard to the matters specified in sub-rule (2), by general or special 
 

 
 
 
order, direct that any person or class of persons shall not be removed from the prison in which he or they 
may be confined or detained, and thereupon, so long as the order remains in force, no order made under 
rule 2, whether before or after the date of the order made by the State Government, shall have effect in 
respect of such person or class of persons. 
(2) Before making an order under sub-rule (1), the State Government shall have regard to the 
following matters, namely:— 
(a) the nature of the offence for which, or the grounds on which, the person or class of persons 
have been ordered to be confined or detained in prison; 
(b) the likelihood of the disturbance of public order if the person or class of persons is allowed to 
be removed from the prison; and 
(c) the public interest, generally.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI A/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI A', 'section', 'Rule 5 — Officer in charge of prison to abstain from carrying out order in certain cases', 'Rule 5. Officer in charge of prison to abstain from carrying out order in certain cases
Where the 
person in respect of whom an order is made under rule 2— 
(a) is certified by the medical officer attached to the prison as unfit to be removed from the prison 
by reason of sickness or infirmity; or 
(b) is under committal for trial or under remand pending trial or pending a preliminary 
investigation; or 
(c) is in custody for a period which would expire before the expiration of the time required for                
complying with the order and for taking him back to the prison in which he is confined or detained; or 
(d) is a person to whom an order made by the State Government under rule 4 applies,                 
the officer in charge of the prison shall abstain from carrying out the Court’s order and shall send to 
the Court a statement of reasons for so abstaining.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI A/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI A', 'section', 'Rule 6 — Prisoner to be brought to Court in custody', 'Rule 6. Prisoner to be brought to Court in custody
In any other case, the officer in charge of the 
prison shall, upon delivery of the Court’s order, cause the person named therein to be taken to the Court 
so as to be present at the time mentioned in such order, and shall cause him to be kept in custody in or 
near the Court until he has been examined or until the Court authorises him to be taken back to the prison 
in which he is confined or detained.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVI A/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVI A', 'section', 'Rule 7 — Power to issue commission for examination of witness in prison', 'Rule 7. Power to issue commission for examination of witness in prison
(1) Where it appears to the 
Court that the evidence of a person confined or detained in a prison, whether within the State or elsewhere 
in India, is material in a suit but the attendance of such person cannot be secured under the preceding 
provisions of this Order, the Court may issue a commission for the examination of that person in the 
prison in which he is confined or detained. 
(2) The provisions of Order XXVI shall, so far may be, apply in relation to the examination on commission of 
such person in prison as they apply in relation to the examination on commission of any other person.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVII', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XVII — Adjournment', 'ORDER XVII
ADJOURNMENT') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVII/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVII', 'section', 'Rule 1 — Court may grant time and adjourn hearing', 'Rule 1. Court may grant time and adjourn hearing
1[(1) The court may, if sufficient cause is shown, 
at any stage of the suit, grant time to the parties or to any of them, and may from time to time adjourn the 
hearing of the suit for reasons to be recorded in writing: 
Provided that no such adjournment shall be granted more than three time to a party during hearing of 
the suit.] 
(2) Costs of adjournment.—In every such case the Court shall fix a day for the further hearing of the 
suit, and 2[shall make such orders as to costs occasioned by the adjournment or such higher costs as the 
court deems fit:] 
3[Provided that,—  
(a) when the hearing of the suit has commenced, it shall be continued from day-to-day until all 
the witnesses in attendance have been examined, unless the Court finds that, for the exceptional 
reasons to be recorded by it, the adjournment of the hearing beyond the following day is necessary, 
 

 
 
 
(b) no adjournment shall be granted at the request of a party, except where the circumstances are 
beyond the control of that party, 
(c) the fact that the pleader of a party is engaged in another Court, shall not be a ground for 
adjournment, 
(d) where the illness of a pleader or his inability to conduct the case for any reason, other than his 
being engaged in another Court, is put forward as a ground for adjournment, the Court shall not grant 
the adjournment unless it is satisfied that the party applying for adjournment could not have engaged 
another pleader in time, 
(e) where a witness is present in Court but a party or his pleader is not present or the party or his 
pleader, though present in Court, is not ready to examine or cross-examine the witness, the Court 
may, if it thinks fit, record the statement of the witness and pass such orders as it thinks fit dispensing 
with the examination-in-chief or cross-examination of the witness, as the case may be, by the party or 
his pleader not present or not ready as aforesaid.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVII/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVII', 'section', 'Rule 2 — Procedure if parties fail to appear on day fixed', 'Rule 2. Procedure if parties fail to appear on day fixed
Where, on any day to which the hearing of the 
suit is adjourned, the parties or any of them fail to appear, the Court may proceed to dispose of the suit in 
one of the modes directed in that behalf by Order IX or make such other order as it thinks fit. 
1[Explanation.—Where the evidence or a substantial portion of the evidence of any party has already 
been recorded and such party fails to appear on any day to which the hearing of the suit is adjourned, the 
Court may, in its discretion proceed with the case as if such party were present.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVII/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVII', 'section', 'Rule 3 — Court may proceed notwithstanding either party fails to produce evidence, etc', 'Rule 3. Court may proceed notwithstanding either party fails to produce evidence, etc
Where any 
party to a suit to whom time has been granted fails to produce his evidence, or to cause the attendance of 
his witnesses, or to perform any other act necessary to the further progress of the suit, for which time has 
been allowed 2[the Court may, notwithstanding such default, 
(a) if the parties are present, proceed to decide the suit forthwith; or 
(b) if the parties are, or any of them is, absent, proceed under rule 2.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XVIII — Hearing of the suit and examination of witnesses', 'ORDER XVIII
HEARING OF THE SUIT AND EXAMINATION OF WITNESSES') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 1 — Right to begin', 'Rule 1. Right to begin
The plaintiff has the right to begin unless the defendant admits the facts alleged 
by the plaintiff and contents that either in point of law or on some additional facts alleged by the 
defendant the plaintiff is not entitled to any part of the relief which he seeks, in which case the defendant 
has the right to begin.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 2 — Statement and production of evidence', 'Rule 2. Statement and production of evidence
(1) On the day fixed for the hearing of the suit or on 
any other day to which the hearing is adjourned, the party having the right to begin shall state his case and 
produce his evidence in support of the issues which he is bound to prove. 
(2) The other party shall then state his case and produce his evidence (if any) and may then address 
the Court generally on the whole case. 
(3) The party beginning may then reply generally on the whole case. 
3[(3A) Any party may address oral arguments in a case, and shall, before he concludes the oral                     
arguments, if any, submit if the Court so permits concisely and under distinct headings written arguments 
in support of his case to the Court and such written arguments shall form part of the record. 
 (3B) A copy of such written arguments shall be simultaneously furnished to the opposite party. 
 (3C) No adjournment shall be granted for the purpose of filing the written arguments unless the 
Court, for reasons to be recorded in writing, considers it necessary to grant such adjourment. 
 (3D) The Court shall fix such time-limits for the oral arguments by either of the parties in a case, as it 
thinks fit.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 3 — Evidence where several issues', 'Rule 3. Evidence where several issues
Where there are several issues, the burden of proving some of 
which lies on the other party, the party beginning may, at his option, either produce his evidence on those 
issues or reserve it by way of answer to the evidence produced by the other party; and, in the latter case, 
the party beginning may produce evidence on those issues after the other party has produced all his 
evidence, and the other party may then reply specially on the evidence so produced by the party 
beginning; but the party beginning will then be entitled to reply generally on the whole case.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-3A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 3A — Party to appear before other witnesses', 'Rule 3A. Party to appear before other witnesses
Where a party himself wishes to appear as a 
witness, he shall so appear before any other witness on his behalf has been examined, unless the Court, 
for reasons to be recorded, permits him to appear as his own witness at a later stage.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 4 — Recording of evidence', 'Rule 4. Recording of evidence
(1) In every case, the examination-in-chief of a witness shall be on 
affidavit and copies thereof shall be supplied to the opposite party by the party who calls him for 
evidence: 
Provided that where documents are filed and the parties rely upon the documents, the proof and                 
admissibility of such documents which are filed along with affidavit shall be subject to the orders of the 
Court. 
*[(1A) The affidavits of evidence of all witnesses whose evidence is proposed to be led by a party 
shall be filed simultaneously by that party at the time directed in the first Case Management Hearing. 
 (1B) A party shall not lead additional evidence by the affidavit of any witness (including of a witness 
who has already filed an affidavit) unless sufficient cause is made out in an application for that purpose 
and an order, giving reasons, permitting such additional affidavit is passed by the Court. 
 (1C) A party shall however have the right to withdraw any of the affidavits so filed at any time prior 
to commencement of cross-examination of that witness, without any adverse inference being drawn based 
on such withdrawal:  
Provided that any other party shall be entitled to tender as evidence and rely upon any admission 
made in such withdrawn affidavit.] 
 (2) The evidence (cross-examination and re-examination) of the witness in attendance, whose 
evidence (examination-in-chief) by affidavit has been furnished to the Court, shall be taken either by the 
Court or by the Commissioner appointed by it: 
Provided that the Court may, while appointing a commission under this sub-rule, consider taking into 
account such relevant factors as it thinks fit. 
(3) The Court or the Commissioner, as the case may be, shall record evidence either in writing or 
mechanically in the presence of the Judge or of the Commissioner, as the case may be, and where such 
evidence is recorded by the Commissioner he shall return such evidence together with his report in writing 
signed by him to the Court appointing him and the evidence taken under it shall form part of the record of the 
suit. 
(4) The Commissioner may record such remarks as it thinks material respecting the demeanour of any 
witness while under examination: 
Provided that any objection raised during the recording of evidence before the Commissioner shall be 
recorded by him and decided by the Court at the stage of arguments. 
(5) The report of the Commissioner shall be submitted to the Court appointing the commission within 
sixty days from the date of issue of the commission unless the Court for reasons to be recorded in writing 
extends the time. 
(6) The High Court or the District Judge, as the case may be, shall prepare a panel of Commissioners 
to record the evidence under this rule. 
 
*  Ins. by Act 4 of 2016, s. 16 and Sch., Shall be applicable to commercial disputes of a specified value (w.e.f. 23-10-2015). 
 
 

 
 
 
(7) The Court may by general or special order fix the amount to be paid as remuneration for the 
services of the Commissioner. 
(8) The provisions of rules 16, 16A, 17 and 18 of Order XXVI, in so far as they are applicable, shall 
apply to the issue, execution and return of such commission under this rule.] 
Jammu and Kashmir and Ladakh (UTs).— 
In Rule 4, after sub-rule (1), insert the following sub-rules, namely:- 
(1A) The affidavits of evidence of all witnesses whose evidence is proposed to be led by a party shall be filed 
simultaneously by that party at the time directed in the first Case Management Hearing. 
(1B) A party shall not lead additional evidence by the affidavit of any witness (including of a witness who has 
already filed an affidavit) unless sufficient cause is made out in an application for that purpose and an order, giving 
reasons, permitting such additional affidavit is passed by the court.  
(1C) A party shall however have the right to withdraw any of the affidavits so filed at any time prior to 
commencement of cross-examination of that witness, without any adverse inference being drawn based on such 
withdrawal: 
Provided that any other party shall be entitled to tender as evidence and rely upon any admission made in such 
withdrawn affidavit. 
[Vide the Jammu and Kashmir Reorganisation (Adaptation of Central Laws) Order, 2020, notification 
No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation (Adaptation of 
Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020)].') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-25', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 25 — How evidence shall be taken in appealable cases', 'Rule 25. How evidence shall be taken in appealable cases
In case in which an appeal is allowed, the 
evidence of each witness shall be,—  
(a) taken down in the language of the Court,— 
(i) in writing by, or in the presence and under the personal direction and superintendence of, 
the Judge, or 
(ii) from the dictation of the Judge directly on a typewriter; or 
(b) if the Judge, for reasons to be recorded, so directs, recorded mechanically in the language of 
the Court in the presence of the Judge.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-36', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 36 — When deposition to be interpreted', 'Rule 36. When deposition to be interpreted
Where the evidence is taken down in a language different 
from that in which it is given, and the witness does not understand the language in which it is taken down, 
the evidence as taken down in writing shall be interpreted to him in the language in which it is given.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-37', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 37 — Evidence under section 138', 'Rule 37. Evidence under section 138
Evidence taken down under section 138 shall be in the form 
prescribed by rule 5 and shall be read over and signed and, as occasion may require, interpreted and corrected 
as if it were evidence taken down under that rule.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-38', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 38 — Memorandum when evidence not taken down by Judge', 'Rule 38. Memorandum when evidence not taken down by Judge
Where the evidence is not taken down 
in writing by the Judge, 4[or from his dictation in the open Court, or recorded mechanically in his presence,] 
he shall be bound, as the examination of each witness proceeds, to make a memorandum of the substance of 
what each witness deposes, and such memorandum shall be written and signed by the Judge and shall form 
part of the record. 
 
the Oudh Courts Act, 1925 (U. P. Act 4 of 1925), s. 16. 
of Oudh, see, s. 16,  ibid.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-29', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 29 — When evidence may be taken in English', 'Rule 29. When evidence may be taken in English
(1) Where English is not the language of the Court, but all the 
parties to the suit who appear in person, and the pleaders of such of the parties as appear by pleaders, do not object 
to having such evidence as is given in English, being taken down in English, the judge may so take it down or cause 
it to be taken down. 
(2) Where evidence is not given in English but all the parties who appear in person, and the pleaders of such of 
the parties as appear by pleaders, do not object to having such evidence being taken down in English, the Judge may 
take down, or cause to be taken down, such evidence in English.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 10 — Any particular question and answer may be taken down', 'Rule 10. Any particular question and answer may be taken down
The Court may, of its own motion or on the 
application of any party or his pleader, take down any particular question and answer, or any objection to any 
question, if there appears to be any special reason for so doing.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-311', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 311 — Questions objected to and allowed by Court', 'Rule 311. Questions objected to and allowed by Court
Where any question put to a witness is objected to by a party or 
his pleader, and the Court allows the same to be put, the Judge shall take down the question, the answer, the objection and 
the name of the person making it, together with the decision of the Court thereon.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 12 — Remarks on demeanour of witnesses', 'Rule 12. Remarks on demeanour of witnesses
The Court may record such remarks as it thinks material 
respecting the demeanour of any witness while under examination.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-313', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 313 — Memorandum of evidence in unappealable cases', 'Rule 313. Memorandum of evidence in unappealable cases
In cases in which an appeal is not allowed, it shall not 
be necessary to take down or dictate or record the evidence of the witnesses at length; but the Judge, as the examination 
of each witness proceeds shall make in writing, or dictate directly on the typewriter, or cause to be mechanically 
recorded, a memorandum of the substance of what the witness deposes, and such memorandum shall be signed by the 
Judge or otherwise authenticated, and shall form part of the record.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-14', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 14 — [Judge unable to make such memorandum to record reasons of his inability] omitted by the Code of Civil 
Procedure (Amendment) Act, 1976 (104 of 1976), s', 'Rule 14. [Judge unable to make such memorandum to record reasons of his inability] omitted by the Code of Civil 
Procedure (Amendment) Act, 1976 (104 of 1976), s
69 (w.e.f. 1-2-1977).]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-315', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 315 — Power to deal with evidence taken before another Judge', 'Rule 315. Power to deal with evidence taken before another Judge
(1) Where a Judge is prevented by death, 
transfer or other cause from concluding the trial of a suit, his successor may deal with any evidence or memorandum 
taken down or made under the foregoing rules as if such evidence or memorandum had been taken down or made by him 
or under his direction under the said rules and may proceed with the suit from the stage at which his predecessor left it. 
(2) The provisions of sub-rule (1) shall, so far as they are applicable, be deemed to apply to evidence taken in a 
suit transferred under section 24.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-316', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 316 — Power to examine witness immediately', 'Rule 316. Power to examine witness immediately
(1) Where a witness is about to leave the jurisdiction of the 
Court, or other sufficient cause is shown to the satisfaction of the Court why his evidence should be taken 
immediately, the Court may, upon the application of any party or of the witness, at any time after the institution of 
the suit, take the evidence of such witness in manner hereinbefore provided. 
(2) Where such evidence is not taken forthwith and in the presence of the parties, such notice as the Court 
thinks sufficient, of the day fixed for the examination, shall be given to the parties. 
(3) The evidence so taken shall be read over to the witness, and, if he admits it to be correct, shall be signed by 
him, and the Judge shall, if necessary, correct the same, and shall sign it, and it may then be read at any hearing of 
the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-17', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 17 — Court may recall and examine witness', 'Rule 17. Court may recall and examine witness
The Court may at any stage of a suit recall any witness who has 
been examined and may (subject to the law of evidence for the time being in force) put such questions to him as the 
Court thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-17A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 17A — [Production of evidence not previously known or which could not be produced despite due diligence', 'Rule 17A. [Production of evidence not previously known or which could not be produced despite due diligence
]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-18', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 18 — Power of Court to inspect', 'Rule 18. Power of Court to inspect
The Court may at any stage of a suit inspect any property or thing concerning 
which any question may arise 5[and where the Court inspects any property or thing it shall, as soon as may be 
practicable, make a memorandum of any relevant facts observed at such inspection and such memorandum shall 
form a part of the record of the suit]. 
 
of Oudh, see, s. 16 (2), ibid. 
Court of Oudh, see the Oudh Courts Act, 1925 (U. P. Act 4 of 1925), s. 16 (2).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XVIII/R-19', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XVIII', 'section', 'Rule 19 — Power to get statements recorded on commission', 'Rule 19. Power to get statements recorded on commission
Notwithstanding anything contained in 
these rules, the court may, instead of examining witnesses in open court, direct their statements to be 
recorded on commission under rule 4A of Order XXVI.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIX', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XIX — Affidavits', 'ORDER XIX
AFFIDAVITS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIX/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIX', 'section', 'Rule 1 — Power to order any point to be proved by affidavit', 'Rule 1. Power to order any point to be proved by affidavit
Any Court may at any time for sufficient 
reason order that any particular fact or facts may be proved by affidavit, or that the affidavit of any 
witness may be read at the hearing, on such conditions as the Court thinks reasonable: 
Provided that where it appears to the Court that either party bona fide desires the production of a 
witness for cross-examination, and that such witness can be produced, an order shall not be made 
authorising the evidence of such witness to be given by affidavit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIX/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIX', 'section', 'Rule 2 — Power to order attendance of deponent for cross-examination', 'Rule 2. Power to order attendance of deponent for cross-examination
(1) Upon any application 
evidence may be given by affidavit, but the Court may, at the instance of either party, order the 
attendance for cross-examination of the deponent. 
(2) Such attendance shall be in Court, unless the deponent is exempted from personal appearance in 
Court, or the Court otherwise directs.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIX/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIX', 'section', 'Rule 3 — Matters to which affidavits shall be confined', 'Rule 3. Matters to which affidavits shall be confined
(1) Affidavits shall be confined to such facts as 
the deponent is able of his own knowledge to prove, except on interlocutory applications, on which 
statements of his belief may be admitted: provided that the grounds thereof are stated. 
(2) The costs of every affidavit which shall unnecessarily set forth matters of hearsay or argumentative 
matter, or copies of or extracts from documents, shall (unless the Court otherwise directs) be paid by the 
party filing the same.  
Jammu and Kashmir and Ladakh (UTs).— 
In Order XIX of the Code, after Rule 3, insert the following new rules, namely-') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIX/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIX', 'section', 'Rule 4 — Court may control evidence', 'Rule 4. Court may control evidence
(1) The court may, by directions, regulate the evidence as to issues 
on which it requires evidence and the manner in which such evidence may be placed before the court. 
(2) The court may, in its discretion and for reasons to be recorded in writing, exclude evidence that 
would otherwise be produced by the parties.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIX/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIX', 'section', 'Rule 5 — Redacting or rejecting evidence', 'Rule 5. Redacting or rejecting evidence
A court may, in its discretion, for reasons to be recorded in 
writing— 
(i) redact or order the redaction of such portions of the affidavit of examination-in-chief as do not, 
in its view, constitute evidence; or 
     (ii) return or reject an affidavit of examination-in-chief as not constituting admissible evidence.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XIX/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XIX', 'section', 'Rule 6 — Format and guidelines of affidavit of evidence', 'Rule 6. Format and guidelines of affidavit of evidence
An affidavit must comply with the form and 
requirements set forth below:— 
(a) such affidavit should be confined to, and should follow the chronological sequence of, the dates 
and events that are relevant for proving any fact or any other matter dealt with; 
     (b) where the court is of the view that an affidavit is a mere reproduction of the pleadings, or 
contains the legal grounds of any party’s case, the court may, by order, strike out the affidavit or such 
parts of the affidavit, as it deems fit and proper; 
 
 
 
 

 
 
 
(c) each paragraph of an affidavit should, as far as possible, be confined to a distinct portion of the 
subject; 
(d) an affidavit shall state— 
(i) which of the statements in it are made from the deponent''s own knowledge and which are 
matters of information or belief; and 
(ii) the source for any matters of information or belief. 
(e) an affidavit should— 
(i) have the pages numbered consecutively as a separate document (or as one of several 
documents contained in a file); 
(ii) be divided into numbered paragraphs; 
(iii) have all numbers, including dates, expressed in figures; and 
(iv) if any of the documents referred to in the body of the affidavit are annexed to the affidavit 
or any other pleadings, give the annexures and page numbers of such documents that are relied 
upon. 
[Vide the Jammu and Kashmir Reorganisation (Adaptation of Central Laws) Order, 2020, notification 
No. S.O. 1123(E) dated (18-3-2020) and vide Union Territory of Ladakh Reorganisation (Adaptation of 
Central Laws) Order, 2020, Notification No. S.O. 3774(E), dated (23-10-2020)]. 
*[4. Court may control evidence.—(1) The Court may, by directions, regulate the evidence as to 
issues on which it requires evidence and the manner in which such evidence may be placed before the 
Court.  
(2) The Court may, in its discretion and for reasons to be recorded in writing, exclude evidence that 
would otherwise be produced by the parties.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XX — Judgment and decree', 'ORDER XX
JUDGMENT AND DECREE') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 1 — Judgment when pronounced', 'Rule 1. Judgment when pronounced
3[(1) The Court, after the case has been heard, shall pronounce 
judgment in an open Court, either at once, or as soon thereafter as may be practicable and when the 
judgment is to be pronounced on some future day, the Court shall fix a day for that purpose, of which due 
notice shall be given to the parties or their pleaders:] 
4[Provided that where the judgment is not pronounced at once, every endeavour shall be made by the 
Court to pronounce the judgment within thirty days from the date on which the hearing of the case was 
concluded but, where it is not practicable so to do on the ground of the exceptional and extraordinary 
circumstances of the case, the Court shall fix a future day for the pronouncement of the judgment, and 
such day shall not ordinarily be a day beyond sixty days from the date on which the hearing of the case 
was concluded, and due notice of the day so fixed shall be given to the parties or their pleaders.] 
*[(1) The Commercial Court, Commercial Division, or Commercial Appellate Division, as the case 
may be, shall, within ninety days of the conclusion of arguments, pronounce judgment and copies thereof 
shall be issued to all the parties to the dispute through electronic mail or otherwise.] 
4[(2) Where a written judgment is to be pronounced, it shall be sufficient if the findings of the Court 
on each issue and the final order passed in the case are read out and it shall not be necessary for the Court 
to read out the whole judgment 5***. 
(3) The judgment may be pronounced by dictation in open Court to a shorthand writer if the Judge is 
specially empowered by the High Court in this behalf: 
Provided that, where the judgment is pronounced by dictation in open Court, the transcript of the 
judgment so pronounced shall, after making such correction therein as may be necessary, be signed by the 
judge, bear the date on which it was pronounced, and form a part of the record.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 2 — Power to pronounce judgment written by judge’s predecessor', 'Rule 2. Power to pronounce judgment written by judge’s predecessor
6[A Judge shall] pronounce a 
judgment written, but not pronounced, by his predecessor. 
 
(U. P. Act 4 of 1925), s. 16 (2). 
by Act 104 of 1976, s. 70 (w.e.f. 1-2-1977). 
*  Subs. by Act 4 of 2016, s. 16 and Sch., Shall be applicable to commercial disputes of a specified value (w.e.f. 23-10-2015).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 3 — Judgment to be signed', 'Rule 3. Judgment to be signed
The judgment shall be dated and signed by the Judge in open Court at the 
time of pronouncing it and, when once signed, shall not afterwards be altered or added to, save as provided by 
section 152 or on review.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 4 — Judgments of Small Cause Courts', 'Rule 4. Judgments of Small Cause Courts
(1) Judgments of a Court of Small Causes need not contain 
more than the points for determination and the decision thereon. 
(2) Judgments of other Courts.—Judgments of other Courts shall contain a concise statement of the 
case, the points for determination, the decision thereon, and the reasons for such decision.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 5 — Court to state its decision on each issue', 'Rule 5. Court to state its decision on each issue
In suits in which issues have been framed, the Court shall 
state its finding or decision, with the reasons therefor, upon each separate issue, unless the finding upon any 
one or more of the issue is sufficient for the decision of the suit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-5A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 5A — Court to inform parties as to where an appeal lies in cases where parties are not represented by 
pleaders', 'Rule 5A. Court to inform parties as to where an appeal lies in cases where parties are not represented by 
pleaders
Except where both the parties are represented by pleaders, the Court shall, when it pronounces its 
judgment in a case subject to appeal, inform the parties present in Court as to the Court to which an appeal lies 
and the period of limitation for the filing of such appeal and place on record the information so given to the 
parties.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 6 — Contents of decree', 'Rule 6. Contents of decree
(1) The decree shall agree with the judgment; it shall contain the number of the 
suit, the 3[names and descriptions of the parties, their registered addresses,] and particulars of the claim, and 
shall specify clearly the relief granted or other determination of the suit. 
(2) The decree shall also state the amount of costs incurred in the suit, and by whom or out of what 
property and in what proportions such costs are to be paid. 
(3) The Court may direct that the costs payable to one party by the other shall be set off against any sum 
which is admitted or found to be due from the former to the latter.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-6A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 6A — Preparation of decree', 'Rule 6A. Preparation of decree
(1) Every endeavour shall be made to ensure that the decree is drawn up as 
expeditiously as possible and, in any case, within fifteen days from the date on which the judgment is 
pronounced. 
(2) An appeal may be preferred against the decree without filing a copy of the decree and in such a case 
the copy made available to the party by the court shall for the purposes of rule 1 of Order XLI be treated as the 
decree. But as soon as the decree is drawn, the judgment shall cease to have the effect of a decree for the 
purposes of execution or for any other purpose.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-6B', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 6B — Copies of judgments when to be made available', 'Rule 6B. Copies of judgments when to be made available
Where the judgment is pronounced, copies of the 
judgment shall be made available to the parties immediately after the pronouncement of the judgment for 
preferring an appeal on payment of such charges as may be specified in the rule made by the High Court.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 7 — Date of decree', 'Rule 7. Date of decree
The decree shall bear the day on which the judgment was pronounced, and, when the 
judge has satisfied himself that the decree has been drawn up in accordance with the judgment, he shall sign 
the decree.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 8 — Procedure where Judge has vacated office before signing decree', 'Rule 8. Procedure where Judge has vacated office before signing decree
Where a Judge has vacated 
office after pronouncing judgment but without signing the decree, a decree drawn up in accordance with such 
judgment may be signed by his successor or, if the Court has ceased to exist, by the Judge of any Court to 
which such Court was subordinate.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 9 — Decree for recovery of immovable property', 'Rule 9. Decree for recovery of immovable property
Where the subject-matter of the suit is immovable 
property, the decree shall contain a description of such property sufficient to identify the same, and where such 
property can be identified by boundaries or by numbers in a record of settlement or survey, the decree shall 
specify such boundaries or numbers.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 10 — Decree for delivery of movable property', 'Rule 10. Decree for delivery of movable property
Where the suit is for movable property, and the decree is 
for the delivery of such property, the decree shall also state the amount of money to be paid as an alternative if 
delivery cannot be had.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 11 — Decree may direct payment by instalments', 'Rule 11. Decree may direct payment by instalments
(1) Where and in so far as a decree is for the payment of 
money, the Court may for any sufficient reason 5[incorporate in the decree, after hearing such of the parties who had 
appeared personally or by pleader at the last hearing, before judgment, an order that] payment of the amount 
 
1925 (U. P. Act 4 of 1925), s. 16 (2). 

 
 
 
decreed shall be postponed or shall be made by instalments, with or without interest, notwithstanding 
anything contained in the contract under which the money is payable. 
(2) Order, after decree, for payment by instalments.—After the passing of any such decree the Court 
may, on the application of the judgment-debtor and with the consent of the decree-holder, order that payment 
of the amount decreed shall be postponed or shall be made by instalments on such terms as to the payment of 
interest, the attachment of the property of the judgment-debtor, or the taking of security from him, or 
otherwise, as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 12 — Decree for possession and mesne profits', 'Rule 12. Decree for possession and mesne profits
(1) Where a suit is for the recovery of possession of 
immovable property and for rent or mesne profits, the Court may pass a decree— 
(a) for the possession of the property; 
1[(b) for the rents which have accrued on the property during the period prior to the institution of 
the suit or directing an inquiry as to such rent. 
(ba) for the mesne profits or directing an inquiry as to such mesne profits;] 
(c) directing an inquiry as to rent or mesne profits from the institution of the suit until— 
(i) the delivery of possession to the decree-holder, 
(ii) the relinquishment of possession by the judgment-debtor with notice to the decree-holder 
through the Court, or 
(iii) the expiration of three years from the date of the decree,  
whichever, event first occurs. 
(2) Where an inquiry is directed under clause (b) or clause (c), a final decree in respect of the rent or 
mesne profits shall be passed in accordance with the result of such inquiry.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-12A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 12A — Decree for specific performance of contract for the sale or lease of immovable property', 'Rule 12A. Decree for specific performance of contract for the sale or lease of immovable property
Where a decree for the specific performance of a contract for the sale or lease of immovable property orders 
that the purchase-money or other sum be paid by the purchaser or lessee, it shall specify the period within 
which the payment shall be made.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 13 — Decree in administration suit', 'Rule 13. Decree in administration suit
(1) Where a suit is for an account of any property and for its due 
administration under the decree of the Court, the Court shall, before passing the final decree, pass a 
preliminary decree ordering such accounts and inquiries to be taken and made, and giving such other 
directions as it thinks fit. 
(2) In the administration by the Court of the property of any deceased person, if such property proves 
to be insufficient for the payment in full of his debts and liabilities, the same rules shall be observed as to 
the respective rights of secured and unsecured creditors and as to debts and liabilities provable, and as to 
the valuation of annuities and future and contingent liabilities respectively, as may be in force for the time 
being, within the local limits of the Court in which the administration suit is pending with respect to the 
estates of persons adjudged or declared insolvent; and all persons who in any such case would be entitled 
to be paid out of such property, may come in under the preliminary decree, and make such claims against 
the same as they may respectively be entitled to by virtue of this Code.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-14', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 14 — Decree in pre-emption suit', 'Rule 14. Decree in pre-emption suit
(1) Where the Court decrees a claim to pre-emption in respect of a 
particular sale of property and the purchase-money has not been paid into Court, the decree shall—  
(a) specify a day on or before which the purchase-money shall be so paid, and 
(b) direct that on payment into Court of such purchase-money, together with the costs (if any) 
decrees against the plaintiff, on or before the day referred to in clause (a), the defendant shall deliver 
possession of the property to the plaintiff, whose title thereto shall be deemed to have accrued from 
the date of such payment, but that, if the purchase-money and the costs (if any) are not so paid, the 
suit shall be dismissed with costs. 
(2) Where the Court has adjudicated upon rival claims to pre-emption, the decree shall direct,— 
(a) if and in so far as the claims decreed are equal in decree, that the claim of each pre-emptor 
complying with the provisions of sub-rule (1) shall take effect in respect of a proportionate share of 
 

 
 
 
the property including any proportionate share in respect of which the claim of any pre-emptor failing 
to comply with the said provisions would, but for such default, have taken effect; and 
(b) if and in so far as the claims decreed are different in degree, that the claim of the inferior                   
preemptor shall not take effect unless and until the superior pre-emptor has failed to comply with the 
said provisions.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-15', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 15 — Decree in suit for dissolution of partnership', 'Rule 15. Decree in suit for dissolution of partnership
Where a suit is for the dissolution of a partnership, 
or the taking of partnership accounts, the Court, before passing a final decree, may pass a preliminary 
decree declaring the proportionate shares of the parties, fixing the day on which the partnership shall stand 
dissolved or be deemed to have been dissolved, and directing such accounts to be taken, and other acts to 
be done, as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-16', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 16 — Decree in suit for account between principal and agent', 'Rule 16. Decree in suit for account between principal and agent
In a suit for an account of pecuniary 
transactions between a principal and an agent, and in any other suit not hereinbefore provided for, where it is 
necessary, in order to ascertain the amount of money due to or from any party, that an account should be 
taken, 
the Court shall, before passing its final decree, pass a preliminary decree directing such accounts to be 
taken as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-17', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 17 — Special directions as to accounts', 'Rule 17. Special directions as to accounts
The Court may either by the decree directing an account to be 
taken or by any subsequent order give special direction with regard to the mode in which the account is to 
be taken or vouched and in particular may direct that in taking the account the books of account in which the 
accounts in question have been kept shall be taken as prima facie evidence of the truth of the matters therein 
contained with liberty to the parties interested to take such objection thereto as they may be advised.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-18', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 18 — Decree in suit for partition of property or separate possession of a share therein', 'Rule 18. Decree in suit for partition of property or separate possession of a share therein
Where the 
Court passes a decree for the partition of property or for the separate possession of a share therein, then,— 
(1) if and in so far as the decree relates to an estate assessed to the payment of revenue to the 
Government, the decree shall declare the rights of the several parties interested in the property, but 
shall direct such partition or separation to be made by the Collector, or any gazetted subordinate of 
the Collector deputed by him in this behalf, in accordance with such declaration and with the 
provisions of section 54; 
(2) if and in so far as such decree relates to any other immovable property or to movable property, 
the Court may, if the partition or separation cannot be conveniently made without further inquiry, 
pass a preliminary decree declaring the rights of the several parties interested in the property and 
giving such further directions as may be required.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-19', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 19 — Decree when set-off or counter-claim is allowed', 'Rule 19. Decree when set-off or counter-claim is allowed
(1) Where the defendant has been allowed a 
set-off 1[or counter-claim] against the claim of the plaintiff, the decree shall state what amount is due to 
the plaintiff and what amount is due to the defendant, and shall be for the recovery of any sum which 
appears to be due to either party. 
(2) Appeal from decree relating to set-off or counter-claim.—Any decree passed in a suit in which 
a set-off 1[or counter-claim] is claimed shall be subject to the same provisions in respect of appeal to 
which it would have been subject if no set-off 1[or counter-claim] had been claimed. 
(3) The provisions of this rule shall apply whether the set-off is admissible under rule 6 of Order VIII 
or otherwise.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XX/R-20', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XX', 'section', 'Rule 20 — Certified copies of judgment and decree to be furnished', 'Rule 20. Certified copies of judgment and decree to be furnished
Certified copies of the judgment 
and decree shall be furnished to the parties on application to the Court, and at their expense.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXA', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XXA — Costs', 'ORDER XXA
COSTS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXA/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXA', 'section', 'Rule 1 — Provisions relating to certain items', 'Rule 1. Provisions relating to certain items
Without prejudice to the generality of the provisions of this 
Code relating to costs, the Court may award costs in respect of,— 
 

 
 
 
(a) expenditure incurred for the giving of any notice required to be given by law before the 
institution of the suit; 
(b) expenditure incurred on any notice which, though not required to be given by law, has been 
given by any party to the suit to any other party before the institution of the suit; 
(c) expenditure incurred on the typing, writing or printing of pleadings filed by any party; 
(d) charges paid by a party for inspection of the records of the Court for the purposes of the suit; 
(e) expenditure incurred by a party for producing witnesses, even though not summoned through 
Court; and 
(f) in the case of appeals, charges incurred by a party for obtaining any copies of judgments and 
decrees which are required to be filed along with the memorandum of appeal.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXA/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXA', 'section', 'Rule 2 — Costs to be awarded in accordance with the rules made by High Court', 'Rule 2. Costs to be awarded in accordance with the rules made by High Court
The award of Costs 
under this rule shall be in accordance with such rules as the High Court may make in that behalf.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI', 'CPC-1908_2026-06-11', 'CPC-1908', 'chapter', 'Order XXI — Execution of Decrees and Orders', 'ORDER XXI
EXECUTION OF DECREES AND ORDERS') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-1', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 1 — Modes of paying money under decree', 'Rule 1. Modes of paying money under decree
(1) All money, payable under a decree shall be paid as 
follows, namely:— 
(a) by deposit into the court whose duty it is to execute the decree, or sent to that Court by postal 
money order or through a bank; or 
(b) out of Court, to the decree-holder by postal money order or through a bank or by any other 
mode wherein payment is evidenced in writing; or 
(c) otherwise, as the Court which made the decree, directs. 
(2) Where any payments is made under clause (a) or clause (c) of sub-rule (1), the judgment-debtor 
shall give notice thereof to the decree-holder either through the Court or directly to him by 2[speed post 
with registration and proof of delivery]. 
(3) Where money is paid by postal money order or through a bank under clause (a) or clause (b) of 
sub-rule (1), the money order or payment through bank, as the case may be, shall accurately state the 
following particulars, namely:— 
(a) the number of the original suit; 
(b) the names of the parties or where there are more than two plaintiffs or more than two 
defendants, as the case may be, the names of the first two plaintiffs and the first two defendants; 
(c) how the money remitted is to be adjusted, that is to say, whether it is towards the principal, 
interest or costs; 
(d) the number of the execution case of the Court, where such case is pending; and 
(e) the name and address of the payer. 
(4) On any amount paid under clause (a) or clause (c) of sub-rule (1), interest, if any, shall cease to 
run from the date of service of the notice referred to in sub-rule (2). 
(5) On any amount paid under clause (b) of sub-rule (1), interest, if any, shall cease to run from the 
date of such payment: 
Provided that, where the decree-holder refuses to accept the postal money order or payment through a 
bank, interest shall cease to run from the date on which the money was tendered to him, or where he 
avoids acceptance of the postal money order or payment through bank, interest shall cease to run from the 
date on which the money would have been tendered to him in the ordinary course of business of the postal 
authorities or the bank, as the case may be.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-2', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 2 — Payment out of Court to decree-holder', 'Rule 2. Payment out of Court to decree-holder
(1) Where any money payable under a decree of any 
kind is paid out of Court, 3[or decree of any kind is otherwise adjusted] in whole or in part to the 
 

 
 
 
satisfaction of the decree-holder, the decree-holder shall certify such payment or adjustment to the Court 
whose duty it is to execute the decree, and the Court shall record the same accordingly. 
(2) The judgment-debtor 1[or any person who has become surety for the judgment-debtor] also may 
inform the Court of such payment or adjustment, and apply to the Court to issue a notice to the                    
decree-holder to show cause, on a day to be fixed by the Court, why such payment or adjustment should 
not be recorded as certified; and if, after service of such notice, the decree-holder fails to show cause why 
the payment or adjustment should not be recorded as certified, the Court shall record the same 
accordingly. 
      2[(2A) No payment or adjustment shall be recorded at the instance of the judgment-debtor unless— 
(a) the payment is made in the manner provided in rule 1; or 
(b) the payment or adjustment is proved by documentary evidence; or 
(c) the payment or adjustment is admitted by, or on behalf of, the decree-holder in his reply to the 
notice given under sub-rule (2) of rule 1, or before the Court.] 
2(3) A payment or adjustment, which has not been certified or recorded as aforesaid, shall not be 
recognized by any Court executing the decree. 
Courts executing decrees') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-3', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 3 — Lands situate in more than one jurisdiction', 'Rule 3. Lands situate in more than one jurisdiction
Where immovable property forms one estate or 
tenure situate within the local limits of the jurisdiction of two or more Courts, any one of such Courts 
may attach and sell the entire estate or tenure.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-4', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 4 — Transfer to Court of Small Causes', 'Rule 4. Transfer to Court of Small Causes
Where a decree has been passed in a suit of which the value as 
set forth in the plaint did not exceed two thousand rupees and which, as regards its subject-matter, is not 
excepted by the law for the title being in force from the cognizance of either a Presidency or a Provincial Court 
of Small Causes, and the Court which passed it wishes it to be executed in Calcutta, Madras 3[or Bombay], 
such Court may send to the Court of Small Causes in Calcutta, Madras 3[or Bombay], as the case may be, the 
copies and certificates mentioned in rule 6; and such Court of Small Causes shall thereupon execute the decree 
as if it had been passed by itself.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-5', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 5 — Mode of transfer', 'Rule 5. Mode of transfer
Where a decree is to be sent for execution to another Court, the Court which 
passed such decree shall send the decree directly to such other Court whether or not such other Court is 
situated in the same State, but the Court to which the decree is sent for execution shall, if it has no 
jurisdiction to execute the decree, send it to the Court having such jurisdiction.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-6', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 6 — Procedure where Court desires that its own decree shall be executed by another Court', 'Rule 6. Procedure where Court desires that its own decree shall be executed by another Court
The 
Court sending a decree for execution shall send— 
(a) a copy of the decree; 
(b) a certificate setting forth that satisfaction of the decree has not been obtained by execution within 
the jurisdiction of the Court by which it was passed, or, where the decree has been executed in part, the 
extent to which satisfaction has been obtained and what part of the decree remains unsatisfied; and 
(c) a copy of any order for the execution of the decree, or, if no such order has been made, a 
certificate to that effect.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-7', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 7 — Court receiving copies of decree, etc., to file same without proof', 'Rule 7. Court receiving copies of decree, etc., to file same without proof
The Court to which a decree 
is so sent shall cause such copies and certificates to be filed, without any further proof of the decree or 
order for execution, or of the copies thereof, unless the Court, for any special reasons to be recorded 
under the hand of the Judge, requires such proof.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-8', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 8 — Execution of decree or order by Court to which it is sent', 'Rule 8. Execution of decree or order by Court to which it is sent
Where such copies are so filed, the 
decree or order may, if the Court to which it is sent is the District Court, be executed by such Court or be 
transferred for execution to any subordinate Court of competent jurisdiction.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-9', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 9 — Execution by High Court of decree transferred by other Court', 'Rule 9. Execution by High Court of decree transferred by other Court
Where the Court to which the 
decree is sent for execution is a High Court, the decree shall be executed by such Court in the same 
manner as if it had been passed by such Court in the exercise of its ordinary original civil jurisdiction. 
Application for execution') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-10', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 10 — Application for execution', 'Rule 10. Application for execution
Where the holder of a decree desires to execute it, he shall apply to 
the Court which passed the decree or to the officer (if any) appointed in this behalf, or if the decree has 
been sent under the provisions hereinbefore contained to another Court then to such Court or to the proper 
officer thereof.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-11', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 11 — Oral application', 'Rule 11. Oral application
(1) Where a decree is for the payment of money the Court may, on the oral 
application of the decree-holder at the time of the passing of the decree, order immediate execution 
thereof by the arrest of the judgment-debtor, prior to the preparation of a warrant if he is within the 
precincts of the Court. 
(2) Written application.—Save as otherwise provided by sub-rule (1), every application for the 
execution of a decree shall be in writing, signed and verified by the applicant or by some other person 
proved to the satisfaction of the Court to be acquainted with the facts of the case, and shall contain in a 
tabular form the following particulars, namely:—  
(a) the number of the suit; 
(b) the names of the parties; 
(c) the date of the decree; 
(d) whether any appeal has been preferred from the decree; 
(e) whether any, and (if any) what, payment or other adjustment of the matter in controversy has 
been made between the parties subsequently to the decree; 
(f) whether any, and (if any) what, previous applications have been made for the execution of the 
decree, the dates of such applications and their results; 
(g) the amount with interest (if any) due upon the decree, or other relief granted thereby, together 
with particulars of any cross-decree, whether passed before or after the date of the decree sought to be 
executed; 
(h) the amount of the costs (if any) awarded; 
(i) the name of the person against whom execution of the decree is sought; and 
(j) the mode in which the assistance of the Court is required whether,— 
(i) by the delivery of any property specifically decreed; 
1[(ii) by the attachment, or by the attachment and sale, or by the sale without attachment, of 
any property;] 
(iii) by the arrest and detention in prison of any person; 
(iv) by the appointment of a receiver; 
(v) otherwise, as the nature of the relief granted may require. 
(3) The Court to which an application is made under sub-rule (2) may require the applicant to produce 
a certified copy of the decree.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-11A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 11A — Application for arrest to state grounds', 'Rule 11A. Application for arrest to state grounds
Where an application is made for the arrest and 
detention in prison of the judgment-debtor, it shall state, or be accompanied by an affidavit stating, the 
grounds on which arrest is applied for.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-12', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 12 — Application 
for 
attachment 
of 
movable 
property 
not 
in 
judgment-debtor’s           
possession', 'Rule 12. Application 
for 
attachment 
of 
movable 
property 
not 
in 
judgment-debtor’s           
possession
Where an application is made for the attachment of any movable property belonging to a 
judgment-debtor but not in his possession, the decree-holder shall annex to the application an inventory of 
the property to be attached, containing a reasonably accurate description of the same.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-13', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 13 — Application for attachment of immovable property to contain certain particulars', 'Rule 13. Application for attachment of immovable property to contain certain particulars
Where 
an application is made for the attachment of any immovable property belonging to a judgment-debtor, it 
shall contain at the foot—  
(a) a description of such property sufficient to identify the same and, in case such property can be 
identified by boundaries or numbers in a record of settlement or survey, a specification of such 
boundaries or numbers; and 
(b) a specification of the judgment-debtor’s share or interest in such property to the best of the 
belief of the applicant, and so far as he has been able to ascertain the same.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-14', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 14 — Power to require certified extract from Collector’s register in certain cases', 'Rule 14. Power to require certified extract from Collector’s register in certain cases
Where an 
application is made for the attachment of any land which is registered in the office of the Collector, the 
Court may require the applicant to produce a certified extract from the register of such office, specifying 
the persons registered as proprietors of, or as possessing any transferable interest in, the land or its 
revenue, or as liable to pay revenue for the land, and the shares of the registered proprietors.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-15', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 15 — Application for execution by Joint decree-holders', 'Rule 15. Application for execution by Joint decree-holders
(1) Where a decree has been passed 
jointly in favour of more persons than one, any one or more of such persons may, unless the decree 
imposes any condition to the contrary, apply for the execution of the whole decree for the benefit of them 
all, or, where any of them has died, for the benefit of the survivors and the legal representatives of the 
deceased. 
(2) Where the Court sees sufficient cause for allowing the decree to be executed on an application 
made under this rule, it shall make such order as it deems necessary for protecting the interest of the 
persons who have not joined in the application.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-16', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 16 — Application for execution by transferee of decree', 'Rule 16. Application for execution by transferee of decree
Where a decree or, if a decree has been 
passed jointly in favour of two or more persons, the interest of any decree-holder in the decree is 
transferred by assignment in writing or by operation of law, the transferee may apply for execution of the 
decree to the Court which passed it; and the decree may be executed in the same manner and subject to 
the same conditions as if the application were made by such decree-holder: 
Provided that, where the decree, or such interest as aforesaid, has been transferred by assignment, 
notice of such application shall be given to the transferor and the judgment-debtor, and the decree shall 
not be executed until the Court has heard their objections (if any) to its execution: 
Provided also that, where a decree for the payment of money against two or more persons has been 
transferred to one of them, it shall not be executed against the others. 
1[Explanation.—Nothing in this rule shall affect the provisions of section 146, and a transferee of 
rights in the property, which is the subject matter of the suit, may apply for execution of the decree 
without a separate assignment of the decree as required by this rule.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-17', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 17 — Procedure on receiving application for execution of decree', 'Rule 17. Procedure on receiving application for execution of decree
(1) On receiving an application 
for the execution of a decree as provided by rule 11, sub-rule (2), the Court shall ascertain whether such 
of the requirements of rules 11 to 14 as may be applicable to the case have been complied with; and, if 
they have not been complied with, 2[the Court shall allow] the defect to be remedied then and there or 
within a time to be fixed by it.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-1A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 1A — If the defect is not so remedied, the Court shall reject the application: 
Provided that where, in the opinion of the Court, there is some inaccuracy as to the amount referred to 
in clauses (g) and (h) of sub-rule (2) of rule 11, the Court shall, instead of rejecting the application, decide 
 

 
 
 
provisionally (without prejudice to the right of the parties to have the amount finally decided in the course 
of the proceedings) the amount and make an order for the execution of the decree for the amount so 
provisionally decided.] 
(2) Where an application is amended under the provisions of sub-rule (1), it shall be deemed to have 
been an application in accordance with law and presented on the date when it was first presented', 'Rule 1A. If the defect is not so remedied, the Court shall reject the application: 
Provided that where, in the opinion of the Court, there is some inaccuracy as to the amount referred to 
in clauses (g) and (h) of sub-rule (2) of rule 11, the Court shall, instead of rejecting the application, decide 
 

 
 
 
provisionally (without prejudice to the right of the parties to have the amount finally decided in the course 
of the proceedings) the amount and make an order for the execution of the decree for the amount so 
provisionally decided.] 
(2) Where an application is amended under the provisions of sub-rule (1), it shall be deemed to have 
been an application in accordance with law and presented on the date when it was first presented
(3) Every amendment made under this rule shall be signed or initialled by the Judge. 
(4) When the application is admitted, the Court shall enter in the proper register a note of the 
application and the date on which it was made, and shall, subject to the provisions hereinafter contained, 
order execution of the decree according to the nature of the application: 
Provided that, in the case of a decree for the payment of money, the value of the property attached 
shall, as nearly as may be, correspond with the amount due under the decree.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-18', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 18 — Execution in case of cross-decrees', 'Rule 18. Execution in case of cross-decrees
(1) Where applications are made to a Court for the 
execution of cross-decrees in separate suits for the payment of two sums of money passed between the 
same parties and capable of execution at the same time by such Court, then—  
(a) if the two sums are, equal, satisfaction shall be entered upon both decrees; and 
(b) if the two sums are unequal execution may be taken out only by the holder of the decree for 
the larger sum and for so much only as remains after deducting the smaller sum, and satisfaction for 
the smaller sum shall be entered on the decree for the larger sum as well as satisfaction on the decree 
for the smaller sum. 
(2) This rule shall be deemed to apply where either party is an assignee of one of the decrees and as 
well in respect of judgment-debts due by the original assignor as in respect of judgment-debts due by the 
assignee himself. 
(3) This rule shall not be deemed to apply unless—  
(a) the decree-holder in one of the suits in which the decrees have been made is the                     
judgment-debtor in the other and each party files the same character in both suits; and 
(b) the sums due under the decrees are definite. 
(4) The holder of a decree passed against several persons jointly and severally may treat it as a                  
cross-decree in relation to a decree passed against him singly in favour of one or more of such persons. 
Illustrations 
(a) A holds a decree against B for Rs. 1,000. B holds a decree against A for payment of Rs. 1,000 in case A fails 
to deliver certain goods at a future day. B cannot treat his decree as a cross-decree under this rule. 
(b) A and B, co-plaintiffs, obtain a decree for Rs. 1,000. against C, and C obtains a decree for Rs. 1,000 against 
B. C cannot treat his decree as a cross-decree under this rule. 
A obtains a decree against B for Rs. 1,000. C, who is a trustee for B, obtains a decree on behalf of B against A 
for Rs. 1,000. B cannot treat C''s decree as a cross-decree under this rule. 
A, B, C, D and E are jointly and severally liable for Rs. 1,000 under a decree obtained by F. A obtains a decree 
for Rs. 1,000 against F singly and applies for execution to the Court in which the joint-decree is being executed. F 
may treat his joint-decree as cross-decree under this rule.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-19', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 19 — Execution in case of cross-claims under same decree', 'Rule 19. Execution in case of cross-claims under same decree
Where application is made to a Court 
for the execution of a decree under which two parties are entitled to recover sums of money from each 
other, then—  
(a) if the two sums are equal, satisfaction for both shall be entered upon the decree; and 
(b) if the two sums are unequal, execution may be taken out only by the party entitled to the larger 
sum and for so much only as remains after deducting the smaller sum, and satisfaction for the smaller 
sum shall be entered upon the decree.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-20', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 20 — Cross-decrees and cross-claims in mortgage suits', 'Rule 20. Cross-decrees and cross-claims in mortgage suits
The provisions contained in rules 18 and 
19 shall apply to decrees for sale in enforcement of a mortgage or charge.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-21', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 21 — Simultaneous execution', 'Rule 21. Simultaneous execution
The Court may, in its discretion, refuse execution at the same time 
against the person and property of the judgment-debtor.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-22', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 22 — Notice to show cause against execution in certain cases', 'Rule 22. Notice to show cause against execution in certain cases
(1) Where an application for 
execution is made—  
(a) more than 1[two years] after the date of the decree, or 
(b) against the legal representative of a party to the decree 2[or where an application is made for 
execution of a decree filed under the provisions of section 44A], 3[or] 
 3[(c) against the assignee or receiver in insolvency, where the party to the decree has been 
adjudged to be an insolvent,] 
the Court executing the decree shall issue a notice to the person against whom execution is applied for 
requiring him to show cause, on a date to be fixed, why the decree should not be executed against him: 
Provided that no such notice shall be necessary in consequence of more than 1[two years] having 
elapsed between the date of the decree and the application for execution if the application is made within    
1[two years] from the date of the last order against the party against whom execution is applied for, made 
on any previous application for execution, or in consequence of the application being made against the 
legal representative of the judgment-debtor if upon a previous application for execution against the same 
person the Court has ordered execution to issue against him. 
(2) Nothing in the foregoing sub-rule shall be deemed to preclude the Court from issuing any process 
in execution of a decree without issuing the notice thereby prescribed, if, for reasons to be recorded, it 
considers that the issue of such notice would cause unreasonable delay or would defeat the ends of 
justice.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-22A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 22A — Sale not be set aside on the death of the judgment-debtor before the sale but after the service 
of the proclamation of sale', 'Rule 22A. Sale not be set aside on the death of the judgment-debtor before the sale but after the service 
of the proclamation of sale
Where any property is sold in execution of a decree, the sale shall not be set 
aside merely by reason of the death of the judgment-debtor between the date of issue of the proclamation of 
sale and the date of the sale notwithstanding the failure of the decree-holder to substitute the legal 
representative of such deceased judgment-debtor, but, in case of such failure, the Court may set aside the sale 
if it is satisfied that the legal representative of the deceased judgment-debtor has been prejudiced by the sale.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-23', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 23 — Procedure after issue of notice', 'Rule 23. Procedure after issue of notice
(1) Where the person to whom notice is issued under 4[rule 22] 
does not appear or does not show cause to the satisfaction of the Court why the decree should not be 
executed, the Court shall order the decree to be executed. 
(2) Where such person offers any objection to the execution of the decree, the Court shall consider 
such objection and make such order as it thinks fit. 
Process for execution') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-24', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 24 — Process for execution', 'Rule 24. Process for execution
(1) When the preliminary measures (if any) required by the foregoing 
rules have been taken, the Court shall, unless it sees cause to the contrary, issue its process for the 
execution of the decree. 
(2) Every such process shall bear date the day on which it is issued, and shall be signed by the Judge 
or such officer as the Court may appoint in this behalf, and shall be sealed with the seal of the Court and 
delivered to the proper officer to be executed. 
5[(3) In every such process, a day shall be specified on or before which it shall be executed and a day 
shall also be specified on or before which it shall be returned to the Court, but no process shall be deemed 
to be void if no day for its return is specified therein.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-25', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 25 — Endorsement on process', 'Rule 25. Endorsement on process
(1) The officer entrusted with the execution of the process shall 
endorse thereon the day on, and the manner in, which it was executed, and, if the latest day specified in 
the process for the return thereof has been exceeded, the reason of the delay, or, if it was not executed, the 
reason why it was not executed, and shall return the process with such endorsement to the Court. 
(2) Where the endorsement is to the effect that such officer is unable to execute the process, the Court 
shall examine him touching his alleged inability, and may, if it thinks fit, summon and examine witnesses 
as to such inability, and shall record the result. 
Stay of execution') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-26', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 26 — When Court may stay execution', 'Rule 26. When Court may stay execution
(1) The Court to which a decree has been sent for execution 
shall, upon sufficient cause being shown, stay the execution of such decree for a reasonable time, to enable 
the judgment-debtor to apply to the Court by which the decree was passed, or to any Court having 
appellate jurisdiction in respect of the decree or the execution thereof, for an order to stay execution, or for 
any other order relating to the decree or execution which might have been made by such Court of first 
instance or Appellate Court if execution had been issued thereby, or if application for execution had been 
made thereto. 
(2) Where the property or person of the judgment-debtor has been seized under an execution, the 
Court which issued the execution may order the restitution of such property or the discharge of such 
person pending the result of the application. 
(3) Power to require security from, or impose conditions upon, judgment-debtor.—Before 
making an order to stay execution, or for the restitution of property or the discharge of the                     
judgment-debtor, 1[the Court shall require] such security from, or impose such condition upon, the 
judgment-debtor as it thinks fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-27', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 27 — Liability of judgment-debtor discharged', 'Rule 27. Liability of judgment-debtor discharged
No order of restitution or discharge under rule 26 
shall prevent the property or person of a judgment-debtor from being retaken in execution of the decree 
sent for execution.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-28', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 28 — Order of Court which passed decree or of Appellate Court to be binding upon Court                     
applied to', 'Rule 28. Order of Court which passed decree or of Appellate Court to be binding upon Court                     
applied to
Any order of the Court by which the decree was passed, or of such Court of appeal as aforesaid, 
in relation to the execution of such decree, shall be binding upon the Court to which the decree was sent for 
execution.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-29', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 29 — Stay of execution pending suit between decree-holder and judgment-debtors', 'Rule 29. Stay of execution pending suit between decree-holder and judgment-debtors
Where a suit is 
pending in any Court against the holder of a decree of such Court 2[or of a decree which is being executed 
by such Court,] on the part of the person against whom the decree was passed, the Court may, on such terms 
as to security or otherwise, as it thinks fit, stay execution of the decree until the pending suit has been 
decided: 
2[Provided that if the decree is one for payment of money, the Court shall, if it grants stay without 
requiring security, record its reasons for so doing.] 
Mode of execution') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-30', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 30 — Decree for payment of money', 'Rule 30. Decree for payment of money
Every decree for the payment of money, including a decree for 
the payment of money as the alternative to some other relief, may be executed by the detention in the civil 
prison of the judgment-debtor, or by the attachment and sale of his property, or by both.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-31', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 31 — Decree for specific movable property', 'Rule 31. Decree for specific movable property
(1) Where the decree is for any specific movable, or for 
any share in a specific movable, it may be executed by the seizure, if practicable, of the movable or share, 
and by the delivery thereof to the party to whom it has been adjudged, or to such person as he appoints to 
receive delivery on his behalf, or by the detention in the civil prison of the judgment-debtor, or by the 
attachment of his property, or by both. 
(2) Where any attachment under sub-rule (1) has remained in force for 3[three months,] if the 
judgment-debtor has not obeyed the decree and the decree-holder has applied to have the attached 
property sold, such property may be sold, and out of the proceeds the Court may award to the                     
decree-holder, in cases where any amount has been fixed by the decree to be paid as an alternative to 
delivery of movable property, such amount, and in other cases, such compensation as it thinks fit, and 
shall pay the balance (if any) to the judgment-debtor on his application. 
 
 

 
 
 
(3) Where the judgment-debtor has obeyed the decree and paid all costs of executing the same which he 
is bound to pay, or where, at the end of  1[three months] from the date of the attachment, no application to 
have the property sold has been made, or, if made, has been refused, the attachment shall cease.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-32', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 32 — Decree for specific performance for restitution of conjugal rights, or for an                     
injunction', 'Rule 32. Decree for specific performance for restitution of conjugal rights, or for an                     
injunction
(1) Where the party against whom a decree for the specific performance of a contract, or for 
restitution of conjugal rights, or for an injunction, has been passed, has had an opportunity of obeying the 
decree and has wilfully failed to obey it, the decree may be enforced 2[in the case of a decree for 
restitution of conjugal rights by the attachment of his property or, in the case of a decree for the specific 
performance of a contract or for an injunction] by his detention in the civil prison, or by the attachment of 
his property, or by both. 
(2) Where the party against whom a decree for specific performance or for an injunction has been 
passed is a corporation, the decree may be enforced by the attachment of the property of the corporation 
or, with the leave of the Court, by the detention in the civil prison of the directors or other principal 
officers thereof, or by both attachment and detention. 
(3) Where any attachment under sub-rule (1) or sub-rule (2) has remained in force for 3[six months,] 
if the judgment-debtor has not obeyed the decree and the decree-holder has applied to have the attached 
property sold, such property may be sold; and out of the proceeds the Court may award to the                    
decree-holder such compensation as it thinks fit, and shall pay the balance (if any) to the judgment-
debtor on his application. 
(4) Where the judgment-debtor has obeyed the decree and paid all costs of executing the same which 
he is bound to pay, or where, at the end of 3[six months] from the date of the attachment no application to 
have the property sold has been made, or if made has been refused, the attachment shall cease. 
(5) Where a decree for the specific performance of a contract or for an injunction has not been obeyed, 
the Court may, in lieu of or in addition to all or any of the processes aforesaid, direct that the act required to 
be done may be done so far as practicable by the decree-holder or some other person appointed by the 
Court, at the cost of the judgment-debtor, and upon the act being done the expenses incurred may be 
ascertained in such manner as the Court may direct and may be recovered as if they were included in the 
decree. 
4[Explanation.—For the removal of doubts, it is hereby declared that the expression “the act required 
to be done” covers prohibitory as well as mandatory injunctions.] 
Illustration 
A, a person of little substance, erects a building which renders uninhabitable a family mansion belonging to B. 
A, in spite of his detention in prison and the attachment of his property, declines to obey a decree obtained against 
him by B and directing him to remove the building. The Court is of opinion that no sum realizable by the sale of A''s 
property would adequately compensate B for the depreciation in the value of his mansion. B may apply to the Court 
to remove the building and may recover the cost of such removal from A in the execution-proceedings.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-33', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 33 — Discretion 
of 
Court 
in 
executing 
decrees 
for 
restitution 
of 
conjugal                     
rights', 'Rule 33. Discretion 
of 
Court 
in 
executing 
decrees 
for 
restitution 
of 
conjugal                     
rights
(1) Notwithstanding anything in rule 32, the Court, either at the time of passing a                     
decree 5[against a husband] for the restitution of conjugal rights or at any time afterwards, may order that 
the decree 6[shall be executed in the manner provided in this rule.] 
(2) Where the Court has made an order under sub-rule (1) 7***, it may order that, in the event of the 
decree not being obeyed within such period as may be fixed in this behalf, the judgment-debtor shall') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-34', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 34 — Decree for execution of document, or endorsement of negotiable instrument', 'Rule 34. Decree for execution of document, or endorsement of negotiable instrument
(1) Where a 
decree is for the execution of a document or for the endorsement of a negotiable instrument and the 
judgment-debtor neglects or refuses to obey the decree, the decree-holder may prepare a draft of the 
document or endorsement in accordance with the terms of the decree and deliver the same to the Court. 
(2) The Court shall there upon cause the draft to be served on the judgment-debtor together with a 
notice requiring his objections (if any) to be made within such time as the Court fixes in this behalf. 
(3) Where the judgment-debtor objects to the draft, his objections shall be stated in writing within 
such time, and the Court shall make such order approving or altering the draft, as it thinks fit. 
(4) The decree-holder shall deliver to the Court a copy of the draft with such alterations (if any) as the 
Court may have directed upon the proper stamp-paper if a stamp is required by the law for the time being 
in force; and the Judge or such officer as may be appointed in this behalf shall execute the document so 
delivered. 
(5) The execution of a document or the endorsement of a negotiable instrument under this rule may 
be in the following form, namely:—  
“C. D., Judge of the Court of, 
(or as the case may be), for A. B., in a suit by E. F against A. B.”, 
and shall have the same effect as the execution of the document or the endorsement of the negotiable 
instrument by the party ordered to execute or endorse the same. 
1[(6) (a) Where the registration of the document is required under any law for the time being in force, 
the Court, or such officer of the Court as may be authorised in this behalf by the Court, shall cause the 
document to be registered in accordance with such law. 
(b) Where the registration of the document is not so required, but the decree-holder desires it to be 
registered, the Court may make such order as it thinks fit. 
(c) Where the Court makes any order for the registration of any document, it may make such order as 
it thinks fit as to the expenses of registration.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-35', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 35 — Decree for immovable property', 'Rule 35. Decree for immovable property
(1) Where a decree is for the delivery of any immovable 
property, possession thereof shall be delivered to the party to whom it has been adjudged, or to such 
person as he may appoint to receive delivery on his behalf, and, if necessary, by removing any person 
bound by the decree who refuses to vacate the property. 
(2) Where a decree is for the joint possession of immovable property, such possession shall be 
delivered by affixing a copy of the warrant in some conspicuous place on the property and proclaiming by 
beat of drum, or other customary mode, at some convenient place, the substance of the decree. 
(3) Where possession of any building on enclosure is to be delivered and the person in possession, 
being bound by the decree, does not afford free access, the Court, through its officers, may, after giving 
reasonable warning and facility to any woman not appearing in public according to the customs of the 
country to withdraw, remove or open any lock or bolt or break open any door or do any other act 
necessary for putting the decree-holder in possession.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-36', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 36 — Decree for delivery of immovable property when in occupancy of tenant', 'Rule 36. Decree for delivery of immovable property when in occupancy of tenant
Where a decree is for 
the delivery of any immovable property in the occupancy of a tenant or other person entitled to occupy the 
same and not bound by the decree to relinquish such occupancy, the Court shall order delivery to be made by 
 

 
 
 
affixing a copy of the warrant in some conspicuous place on the property, and proclaiming to the occupant by 
beat of drum or other customary mode, at some convenient place, the substance of the decree in regard to the 
property.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-37', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 37 — Discretionary power to permit judgment-debtor to show cause against detention in 
prison', 'Rule 37. Discretionary power to permit judgment-debtor to show cause against detention in 
prison
(1) Notwithstanding anything in these rules, where an application is for the execution of a 
decree for the payment of money by the arrest and detention in the civil prison of a judgment-debtor who 
is liable to be arrested in pursuance of the application, the Court 1[shall], instead of issuing a warrant for 
his arrest, issue a notice calling upon him to appear before the Court on a day to be specified in the notice 
and show cause why he should not be committed to the civil prison: 
2[Provided that such notice shall not be necessary if the Court is satisfied, by affidavit, or otherwise, 
that, with the object or effect of delaying the execution of the decree, the judgment-debtor is likely to 
abscond or leave the local limits of the jurisdiction of the Court.] 
(2) Where appearance is not made in obedience to the notice, the Court shall, if the decree-holder so 
requires, issue a warrant for the arrest of the judgment-debtor.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-38', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 38 — Warrant for arrest to direct judgment-debtor to be brought up', 'Rule 38. Warrant for arrest to direct judgment-debtor to be brought up
Every warrant for the 
arrest of a judgment-debtor shall direct the officer entrusted with its execution to bring him before the 
Court with all convenient speed, unless the amount which he has been ordered to pay, together with the 
interest thereon and the costs (if any) to which he is liable, be sooner paid.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-39', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 39 — Subsistence allowance', 'Rule 39. Subsistence allowance
(1) No judgment-debtor shall be arrested in execution of a decree 
unless and until the decree-holder pays into Court such sum as the Judge thinks sufficient for the 
subsistence of the judgment-debtor from the time of his arrest until he can be brought before the Court. 
(2) Where a judgment-debtor is committed to the civil prison in execution of a decree, the Court 
shall fix for his subsistence such monthly allowance as he may be entitled to according to the scales fixed 
under section 57, or, where no such scales have been fixed, as it considers sufficient with reference to the 
class to which he belongs. 
(3) The monthly allowance fixed by the Court shall be supplied by the party on whose application the 
judgement-debtor has been arrested by monthly payments in advance before the first day of each month. 
(4) The first payment shall be made to the proper officer of the Court for such portion of the current 
month as remains unexpired before the judgment-debtor is committed to the civil prison, and the 
subsequent payments (if any) shall be made to the officer in charge of the civil prison. 
(5) Sums disbursed by the decree-holder for the subsistence of the judgment-debtor in the civil 
prison shall be deemed to be costs in the suit: 
Provided that the judgment-debtor shall not be detained in the civil prison or arrested on account of 
any sum so disbursed.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-40', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 40 — Proceedings on appearance of judgment-debtor in obedience to notice or after                      
arrest', 'Rule 40. Proceedings on appearance of judgment-debtor in obedience to notice or after                      
arrest
(1) When a judgment-debtor appears before the Court in obedience to a notice issued under rule 37, 
or is brought before the Court after being arrested in execution of a decree for the payment of money, the Court 
shall proceed to hear the decree-holder and take all such evidence as may be produced by him in support of his 
application for execution and shall then give the judgment-debtor an opportunity of showing cause why he 
should not be committed to the civil prison. 
(2) Pending the conclusion of the inquiry under sub-rule (1) the Court may, in its discretion, order the 
judgment-debtor to be detained in the custody of an officer of the Court or release him on his furnishing 
security to the satisfaction of the Court for his appearance when required. 
 

 
 
 
(3) Upon the conclusion of the inquiry under sub-rule (1) the Court may, subject to the provisions of 
section 51 and to the other provisions of this Code, make an order for the detention of the                     
judgment-debtor in the civil prison and shall in that event cause him to be arrested if he is not already 
under arrest: 
Provided that in order to give the judgment-debtor an opportunity of satisfying the decree, the Court 
may, before making the order of detention, leave the judgment-debtor in the custody of an officer of the 
Court for a specified period not exceeding fifteen days or release him on his furnishing security to the 
satisfaction of the Court for his appearance at the expiration of the specified period if the decree be not 
sooner satisfied. 
(4) A judgment-debtor released under this rule may be re-arrested. 
(5) When the Court does not make an order of detention under sub-rule (3) it shall disallow the 
application and, if the judgment-debtor is under arrest, direct his release.] 
Attachment of property') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-41', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 41 — Examination of judgment-debtor as to his property', 'Rule 41. Examination of judgment-debtor as to his property
1[(1)] Where a decree is for the payment 
of money the decree-holder may apply to the Court for an order that—  
(a) the judgment-debtor, or 
(b) 2[where the judgment-debtor is a corporation], any officer thereof, or 
(c) any other person, 
be orally examined as to whether any or what debts are owing to the judgment-debtor and whether the 
judgment-debtor has any and what other property or means of satisfying the decree; and the Court may 
make an order for the attendance and examination of such judgment-debtor, or officer or other person, 
and for the production of any books or documents. 
3[(2) Where a decree for the payment of money has remained unsatisfied for a period of thirty days, 
the Court may, on the application of the decree-holder and without prejudice to its power under                     
sub-rule (1), by order require the judgment-debtor or where the judgment-debtor is a corporation, any 
officer thereof, to make an affidavit stating the particulars of the assets of the judgment-debtor. 
(3) In case of disobedience of any order made under sub-rule (2), the Court making the order, or any 
Court to which the proceeding is transferred, may direct that the person disobeying the order be detained 
in the civil prison for a term not exceeding three months unless before the expiry of such term the Court 
directs his release.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-42', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 42 — Attachment in case of decree for rent or mesne profits or other matter, amount of which to 
be subsequently determined', 'Rule 42. Attachment in case of decree for rent or mesne profits or other matter, amount of which to 
be subsequently determined
Where a decree directs an inquiry as to rent or mesne profits or any other 
matter, the property of the judgment-debtor may, before the amount due from him has been ascertained, 
be attached, as in the case of an ordinary decree for the payment of money.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-43', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 43 — Attachment of movable property, other than agricultural produce, in possession of 
judgment-debtor', 'Rule 43. Attachment of movable property, other than agricultural produce, in possession of 
judgment-debtor
Where the property to be attached is movable property other than agricultural 
produce, in the possession of the judgement-debtor, the attachment shall be made by actual seizure, and 
the attaching officer shall keep the property in his own custody or in the custody of one of his 
subordinates, and shall be responsible for the due custody thereof: 
Provided that, when the property seized is subject to speedy and natural decay, or when the expense 
of keeping it in custody is likely to exceed its value, the attaching officer may sell it at once.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-43A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 43A — Custody of movable property', 'Rule 43A. Custody of movable property
(1) Where the property attached consists of live-stock, 
agricultural implements or other articles which cannot conveniently be removed and the attaching officer does 
not act under the proviso to rule 43, he may, at the instance of the judgment-debtor or of the decree holder or of 
any other person claiming to be interested in such property, leave it in the village or place where it has 
been attached, in the custody of any respectable person (hereinafter referred to as the “custodian”). 
(2) If the custodian fails, after due notice, to produce such property at the place named by the Court 
before the officer deputed for the purpose or to restore it to the person in whose favour restoration is 
ordered by the Court, or if the property, though so produced or restored, is not in the same condition as it 
was when it was entrusted to him,—  
(a) the custodian shall be liable to pay compensation to the decree-holder, judgment-debtor or any 
other person who is found to be entitled to the restoration thereof, for any loss or damage caused by 
his default; and 
(b) such liability may be enforced—  
(i) at the instance of the decree-holder, as if the custodian were a surety under section 145; 
(ii) at the instance of the judgment-debtor or such other person, on an application in 
execution; and 
(c) any order determining such liability shall be appealable as a decree.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-44', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 44 — Attachment of agricultural produce', 'Rule 44. Attachment of agricultural produce
Where the property to be attached is agricultural 
produce, the attachment shall be made by affixing a copy of the warrant of attachment,—  
(a) where such produce is a growing crop, on the land on which such crop has grown, or 
(b) where such produce has been cut or gathered, on the threshing floor or place for treading out 
grain or the like or fodder-stack on or in which it is deposited, 
and another copy on the outer door or on some other conspicuous part of the house in which the 
judgment-debtor ordinarily resides or, with the leave of the Court, on the outer door or on some other 
conspicuous part of the house in which he carries on business or personally works for gain or in which he 
is known to have last resided or carried on business or personally worked for gain; and the produce shall 
thereupon be deemed to have passed into the possession of the Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-45', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 45 — Provisions as to agricultural produce under attachment', 'Rule 45. Provisions as to agricultural produce under attachment
(1) Where agricultural produce is 
attached, the Court shall make such arrangements for the custody thereof as it may deem sufficient and, 
for the purpose of enabling the Court to make such arrangements, every application for the attachment of 
a growing crop shall specify the time at which it is likely to be fit to be cut or gathered. 
(2) Subject to such conditions as may be imposed by the Court in this behalf either in the order of 
attachment or in any subsequent order, the judgment-debtor may tend, cut, gather and store the produce and do 
any other act necessary for maturing or preserving it; and if the judgment-debtor fails to do, all or any of such 
acts, the decree-holder may, with the permission of the Court and subject to the like conditions, do all or any of 
them either by himself or by any person appointed by him in this behalf and the costs incurred by the                
decree-holder shall be recoverable from the judgment-debtor as if they were included in, or formed part of, the 
decree. 
(3) Agricultural produce attached as a growing crop shall not be deemed to have ceased to be under 
attachment or to require re-attachment merely because it has been served from the soil. 
(4) Where an order for the attachment of a growing crop has been made at a considerable time before 
the crop is likely to be fit to be cut or gathered, the Court may suspend the execution of the order for such 
time as it thinks fit, and may, in its discretion, make a further order prohibiting the removal of the crop 
pending the execution of the order of attachment. 
(5) A growing crop which from its nature does not admit of being stored shall not be attached under 
this rule at any time less than twenty days before the time at which it is likely to be fit to be cut or gathered.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-46', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 46 — Attachment of debt, share and other property not in possession of judgment-debtor', 'Rule 46. Attachment of debt, share and other property not in possession of judgment-debtor
(1) In 
the case of—  
(a) a debt not secured by a negotiable instrument, 
 
  

 
 
 
(b) a share in the capital of a corporation, 
(c) other movable property not in the possession of the judgment-debtor, except property 
deposited in, or in the custody of, any Court, 
the attachment shall be made by a written order prohibiting,—  
(i) in the case of the debt, the credit or from recovering the debt and the debtor from making 
payment thereof until the further order of the Court; 
(ii) in the case of the share, the person in whose name the share may be standing from transferring 
the same or receiving any dividend thereon; 
(iii) in the case of the other movable property except as aforesaid, the person in possession of the 
same from giving it over to the judgment-debtor. 
(2) A copy of such order shall be affixed on some conspicuous part of the court-house, and another 
copy shall be sent in the case of the debt, to the debtor; in the case of the share, to the proper officer of the 
corporation, and, in the case of the other movable property (except as aforesaid), to the person in 
possession of the same. 
(3) A debtor prohibited under clause (i) of sub-rule (1) may pay the amount of his debt into Court, 
and such payment shall discharge him as effectually as payment to the party entitled to receive the same.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-46A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 46A — Notice to garnishee', 'Rule 46A. Notice to garnishee
(1) The Court may in the case of a debt (other than a debt secured by a 
mortgage or a charge) which has been attached under rule 46, upon the application of the attaching 
creditor, issue notice to the garnishee liable to pay such debt, calling upon him either to pay into Court the 
debt due from him to the judgment-debtor or so much thereof as may be sufficient to satisfy the decree 
and costs of execution, or to appear and show cause why he should not do so. 
(2) An application under sub-rule (1) shall be made on affidavit verifying the facts alleged and stating 
that in the belief of the deponent, the garnishee is indebted to the judgment-debtor. 
(3) Where the garnishee pays in the Court the amount due from him to the judgment-debtor or so 
much thereof as is sufficient to satisfy the decree and the costs of the execution, the Court may direct that 
the amount may be paid to the decree-holder towards satisfaction of the decree and costs of the execution.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-46B', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 46B — Order against garnishee', 'Rule 46B. Order against garnishee
Where the garnishee does not forthwith pay into Court the amount 
due from him to the judgment-debtor or so much thereof as is sufficient to satisfy the decree and the costs 
of execution, and does not appear and show cause in answer to the notice, the Court may order the 
garnishee to comply with the terms of such notice, and on such order, execution may issue as though such 
order were a decree against him.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-46C', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 46C — Trial of disputed questions', 'Rule 46C. Trial of disputed questions
Where the garnishee disputes liability, the Court may order that 
any issue of question necessary for the determination of liability shall be tried as if it where an issue in a 
suit, and upon the determination of such issue shall make such order or orders as it deems fit: 
Provided that if the debt in respect of which the application under rule 46A is made is in respect of a 
sum of money beyond the pecuniary jurisdiction of the Court, the Court shall send the execution case to 
the Court of the District Judge to which the said Court is subordinate, and thereupon the Court of the 
District Judge or any other competent Court to which it may be transferred by the District Judge shall deal 
with it in the same manner as if the case had been originally instituted in that Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-46D', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 46D — Procedure where debt belongs to third person', 'Rule 46D. Procedure where debt belongs to third person
Where it is suggested or appears to be 
probable that the debt belongs to some third person, or that any third person has a lien or charge on, or 
other interest in such debt, the Court may order such third person to appear and state the nature and 
particulars of his claim, if any, to such debt and prove the same.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-46E', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 46E — Order as regards third person', 'Rule 46E. Order as regards third person
After hearing such third person and any person or persons who 
may subsequently be ordered to appear, or where such third or other person or persons do not appear when so 
ordered, the Court may make such order as is hereinbefore provided, or such other order or orders upon such') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-46F', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 46F — Payment by garnishee to be valid discharge', 'Rule 46F. Payment by garnishee to be valid discharge
Payment made by the garnishee on notice 
under rule 46A or under any such order as aforesaid shall be a valid discharge to him as against the 
judgment-debtor and any other person ordered to appear as aforesaid for the amount paid or levied, 
although the decree in execution of which the application under rule 46A was made, or the order passed 
in the proceedings on such application may be set aside or reversed.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-46G', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 46G — Costs', 'Rule 46G. Costs
The costs of any application made under rule 46A and of any proceeding arising                    
there from or incidental thereto shall be in the discretion of the Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-46H', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 46H — Appeals', 'Rule 46H. Appeals
An order made under rule 46B, rule 46C or rule 46E shall be applicable as a decree. 
46-I. Application to negotiable instruments.—The provisions of rules 46A to 46H (both inclusive) 
shall, so far as may be, apply in relation to negotiable instruments attached under rule 51 as they apply in 
relation to debts.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-47', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 47 — Attachment of share in movables', 'Rule 47. Attachment of share in movables
Where the property to be attached consists of the share or 
interest of the judgment-debtor in movable property belonging to him and another as co-owners, the 
attachment shall be made by a notice to the judgment-debtor prohibiting him from transferring the share 
or interest or charging it in any way.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-48', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 48 — Attachment of salary or allowances of servant of the Government or railway company or 
local authority', 'Rule 48. Attachment of salary or allowances of servant of the Government or railway company or 
local authority
(1) Where the property to be attached is the salary or allowances of a 1[servant of the 
Government] or of a servant of a railway company or local authority 2[or of a servant of a corporation 
engaged in any trade or industry which is established by a Central, Provincial or State Act, or a 
Government company as defined in section 617 of the Companies Act, 1956 (1 of 1956)] the Court, 
whether the judgment-debtor or the disbursing officer is or is not within the local limits of the Court’s 
jurisdiction, may order that the amount shall, subject to the provisions of section 60, be withheld from 
such salary or allowances either in one payment or by monthly instalments as the Court may direct; and 
upon notice of the order to such officer as 3[the appropriate Government may by notification in the 
Official Gazette] appoint 4[in this behalf,— 
(a) where such salary or allowances are to be disbursed within the local limits to which this Code 
for the time being extends, the officer or other person whose duty it is to disburse the same shall 
withhold and remit to the Court the amount due under the order, or the monthly instalments, as the 
case may be; 
(b) where such salary or allowances are to be disbursed beyond the said limits, the officer or other 
person within those limits whose duty it is to instruct the disbursing authority regarding the amount of 
the salary or allowances to be disbursed shall remit to the Court the amount due under the order, or the 
monthly instalments, as the case may be, and shall direct the disbursing authority to reduce the 
aggregate of the amounts from time to time to be disbursed by the aggregate of the amounts from time 
to time remitted to the Court.] 
(2) Where the attachable proportion of such salary or allowances is already being withheld and 
remitted to a Court in pursuance of a previous and unsatisfied order of attachment, the officer appointed 
by 5[the appropriate Government] in this behalf shall forthwith return the subsequent order to the Court 
issuing it with a full statement of all the particulars of the existing attachment. 
 
notification in their Official Gazette”. 
may be”. 

 
 
 
1[(3) Every order made under this rule, unless it is returned in accordance with the provisions of            
sub-rule (2) shall, without further notice or other process, bind the appropriate Government or the railway 
company or local authority or corporation of Government company, as the case may be, while the                
judgment-debtor is within the local limits to which this Code for the time being extends and while he is 
beyond those limits, if he is in receipt of any salary or allowances payable out of the Consolidated Fund of 
India or the Consolidated Fund of the State or the funds of a railway company or local authority or 
corporation or Government company in India; and the appropriate Government or the railway company or 
local authority or corporation or Government company, as the case may be, shall be liable for any sum paid in 
contravention of this rule.] 
2[Explanation.—In this rule, “appropriate Government” means,— 
(i) as respects any person in the service of the Central Government, or any servant of a railway 
administration or of a cantonment authority or of the port authority of a major port, or any servant of 
a corporation engaged in any trade or industry which is established by a Central Act, or any servant of 
a Government company in which any part of the share capital is held by the Central Government or 
by more than one State Governments or partly by the Central Government and partly by one or more 
State Governments, the Central Government; 
(ii) as respects any other servant of the Government, or a servant of any other local or other 
authority, or any servant of a corporation engaged in any trade or industry which is established by a 
Provincial or State Act, or a servant of any other Government company, the State Government.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-48A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 48A — Attachment of salary or allowances of private employees', 'Rule 48A. Attachment of salary or allowances of private employees
(1) Where the property to be 
attached is the salary or allowances of an employee other than an employee to whom rule 48 applies, the 
Court, where the disbursing officer of the employee is within the local limits of the Court’s jurisdiction, 
may order that the amount shall, subject to the provision of section 60, be withheld from such salary or 
allowances either in one payment or by monthly instalments as the Court may direct; and upon notice of 
the order to such disbursing officer, such disbursing officer shall remit to the Court the amount due under 
the order, or the monthly instalments, as the case may be. 
(2) Where the attachable portion of such salary or allowances is already being withheld or remitted to 
the Court in pursuance of a previous and unsatisfied order of attachment, the disbursing officer shall 
forthwith return the subsequent order to the Court issuing it with a full statement of all the particulars of 
the existing attachment. 
(3) Every order made under this rule, unless it is returned in accordance with the provisions of             
sub-rule (2), shall, without further notice or other process, bind the employer while the                      
judgment-debtors, is within the local limits to which this Code for the time being extends and while he is 
beyond those limits, if he is in receipt of salary or allowances payable out of the funds of an employer in 
any part of India, and the employer shall be liable for any sum paid in contravention of this rule.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-49', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 49 — Attachment of partnership property', 'Rule 49. Attachment of partnership property
(1) Save as otherwise provided by this rule, property 
belonging to a partnership shall not be attached or sold in execution of a decree other than a decree 
passed against the firm or against the partners in the firm as such. 
(2) The Court may, on the application of the holder of a decree against a partner, make an order 
charging the interest of such partner in the partnership property, and profits with payment of the amount due 
under the decree, and may, by the same or a subsequent order, appoint a receiver of the share of such partner 
in the profits (whether already declared or accruing) and of any other money which may be coming to him in 
respect of the partnership, and direct accounts and inquiries and make an order for the sale of such interest or 
other orders as might have been directed or made if a charge had been made in favour of the decree holder 
by such partner, or as the circumstances of the case may require. 
(3) The other partner or partners shall be at liberty at any time to redeem the interest charged or, in 
the case of a sale being directed, to purchase the same. 
 

 
 
 
(4) Every application for an order under sub-rule (2) shall be served on the judgment-debtor and on 
his partners or such of them as are within 1[India]. 
(5) Every application made by any partner of the judgment-debtor under sub-rule (3) shall be served 
on the decree-holder and on the judgment-debtor, and on such of the other partners as do not join in the 
application and as are within 1[India]. 
(6) Service under sub-rule (4) or sub-rule (5) shall be deemed to be service on all the partners and all 
orders made on such applications shall be similarly served.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-50', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 50 — Execution of decree against firm', 'Rule 50. Execution of decree against firm
(1) Where a decree has been passed against a firm, 
execution may be granted—  
(a) against any property of the partnership; 
(b) against any person who has appeared in his own name under rule 6 or rule 7 of Order XXX or 
who has admitted on the pleadings that he is, or who has been adjudged to be, a partner; 
(c) against any person who has been individually served as a partner with a summons and has 
failed to appear: 
Provided that nothing in this sub-rule shall be deemed to limit or otherwise affect the provisions                   
of  2[section 30 of the Indian Partnership Act, 1932 (9 of 1932)]. 
(2) Where the decree-holder claims to be entitled to cause the decree to be executed against any 
person other than such a person as is referred to in sub-rule (1), clauses (b) and (c), as being a partner in 
the firm, he may, apply to the Court which passed the decree for leave, and where the liability is not 
disputed, such Court may grant such leave, or, where such liability is disputed, may order that the liability 
of such person be tried and determined in any manner in which any issue in a suit may be tried and 
determined. 
(3) Where the liability of any person has been tried and determined under sub-rule (2), the order made 
thereon shall have the same force and be subject to the same conditions as to appeal or otherwise as if it 
were a decree. 
(4) Save as against any property of the partnership, a decree against a firm shall not lease, render liable 
or otherwise affect any partner therein unless he has been served with a summons to appear and answer. 
3[(5) Nothing in this rule shall apply to a decree passed against a Hindu Undivided Family by virtue 
of the provisions of rule 10 of Order XXX.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-51', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 51 — Attachment of negotiable instruments', 'Rule 51. Attachment of negotiable instruments
Where the property is a negotiable instrument not 
deposited in a Court, not in the custody of a public officer, the attachment shall be made by actual seizure, 
and the instrument shall be brought into Court and held subject to further orders of the Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-52', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 52 — Attachment of property in custody of Court or public officer', 'Rule 52. Attachment of property in custody of Court or public officer
Where the property to be 
attached is in the custody of any Court or public officer, the attachment shall be made by a notice to such 
Court or officer, requesting that such property, and any interest or dividend becoming payable thereon, 
may be held subject to the further orders of the Court from which the notice is issued: 
Provided that, where such property is in the custody of a Court, any question of title or priority arising 
between the decree-holder and any other person, not being the judgment-debtor, claiming to be interested 
in such property by virtue of any assignment, attachment or otherwise, shall be determined by such Court.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-53', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 53 — Attachment of decrees', 'Rule 53. Attachment of decrees
(1) Where the property to be attached is a decree, either for the 
payment of money or for sale in enforcement of a mortgage or charge, the attachment shall be made,—  
(a) if the decrees were passed by the same Court, then by order of such Court, and 
 

 
 
 
(b) if the decree sought to be attached was passed by another Court, then by the issue to such 
other Court of a notice by the Court which passed the decree sought to be executed, requesting               
such other Court to stay the execution of its decree unless and until—  
(i) the Court which passed the decree sought to be executed cancels the notice, or 
1[(ii) (a) the holder of the decree sought to be executed, or 
(b) his judgment-debtor with the previous consent in writing of such decree-holder, or 
with the permission of the attaching Court, 
applies to the Court receiving such notice to execute the attached decree.] 
(2) Where a Court makes an order under clause (a) of sub-rule (1), or receives an application under 
sub-head (ii) of clause (b) of the said sub-rule, it shall, on the application of the creditor who has attached 
the decree or his judgment-debtor, proceeds to execute the attached decree and apply the net proceeds in 
satisfaction of the decree sought to be executed. 
(3) The holder of a decree sought to be executed by the attachment of another of decree the nature 
specified in sub-rule (1) shall be deemed to be the representative of the holder of the attached decree and 
to be entitled to execute such attached decree in any manner lawful for the holder thereof. 
(4) Where the property to be attached in the execution of a decree is a decree other than a decree of 
the nature referred to in sub-rule (1), the attachment shall be made, by a notice by the Court which passed 
the decree sought to be executed, to the holder of the decree sought to be attached, prohibiting him from 
transferring or charging the same in any way; and, where such decree has been passed by any other Court, 
also by sending to such other Court a notice to abstain from executing the decree sought to be attached 
until such notice is cancelled by the Court from which it was sent. 
(5) The holder of a decree attached under this rule shall give the Court executing the decree such 
information and aid as may reasonably be required. 
(6) On the application of the holder of a decree sought to be executed by the attachment of another 
decree, the Court making an order of attachment under this rule shall give notice of such order to the 
judgment-debtor bound by the decree attached; and no payment or adjustment of the attached decree 
made by the judgment-debtor in contravention of such order 2[with knowledge thereof or] after receipt of 
notice thereof, either through the Court or otherwise, shall be recognized by any Court so long as the 
attachment remains in force.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-54', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 54 — Attachment of immovable property', 'Rule 54. Attachment of immovable property
(1) Where the property is immovable, the attachment 
shall be made by an order prohibiting the judgment-debtor from transferring or charging the property in 
any way, and all persons from taking any benefit from such transfer of charge. 
2[(1A) The order shall also require the judgment-debtor to attend Court on a specified date to take 
notice of the date to be fixed for settling the terms of the proclamation of sale.] 
(2) The order shall be proclaimed at some place on or adjacent to such property by beat of drum or other 
customary mode, and a copy of the order shall be affixed on a conspicuous part of the property and then 
upon, a conspicuous part of the Court-house, and also, where the property is land paying revenue to the 
Government, in the office of the Collector of the district in which the land is situate 2[and, where the property 
is land situate in a village, also in the office of the Gram Panchayat, if any, having jurisdiction over that 
village.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-55', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 55 — Removal of attachment after satisfaction of decree', 'Rule 55. Removal of attachment after satisfaction of decree
Where— 
(a) the amount decreed with costs and all charges and expenses resulting from the attachment of 
any property are paid into Court, or 
(b) satisfaction of the decree is otherwise made through the Court or certified to the Court, or 
(c) the decree is set aside or reversed, 
the attachment shall be deemed to be withdrawn, and, in the case of immovable property, the 
withdrawal shall, if the judgment-debtor so desires, be proclaimed at his expense, and a copy of the 
proclamation shall be affixed in the manner prescribed by the last preceding rule.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-56', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 56 — Order for payment of coin or currency notes to party entitled under decree', 'Rule 56. Order for payment of coin or currency notes to party entitled under decree
Where the 
property attached is current coin or currency notes, the Court may, at any time during the continuance of 
the attachment, direct that such coin or notes, or a part thereof sufficient to satisfy the decree, be paid over 
to the party entitled under the decree to receive the same.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-57', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 57 — Determination of attachment', 'Rule 57. Determination of attachment
(1) Where any property has been attached in execution of a 
decree and the Court, for any reason, passes an order dismissing the application for the execution of the 
decree, the Court shall direct whether the attachment shall continue or cease and shall also indicate the 
period up to which such attachment shall continue or the date on which such attachment shall cease. 
(2) If the Court omits to give such direction, the attachment shall be deemed to have ceased.] 
2[Adjudication of claims and objections') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-58', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 58 — Adjudication of claims to or objections to attachment of property', 'Rule 58. Adjudication of claims to or objections to attachment of property
(1) Where any claim is 
preferred to, or any objection is made to the attachment of, any property attached in execution of a decree 
on the ground that such property is not liable to such attachment, the Court shall proceed to adjudicate 
upon the claim or objection in accordance with the provisions herein contained: 
Provided that no such, claim or objection shall be entertained—  
(a) where, before the claim is preferred or objection is made, the property attached has already 
been sold; or 
(b) where the Court considers that the claim or objection was designedly or unnecessarily delayed. 
(2) All questions (including questions relating to right, title or interest in the property attached) arising 
between the parties to a proceeding or their representatives under this rule and relevant to the adjudication of 
the claim or objection, shall be determined by the Court dealing with the claim or objection and not by a 
separate suit. 
(3) Upon the determination of the questions referred to in sub-rule (2), the Court shall, in accordance 
with such determination,—  
(a) allow the claim or objection and release the property from attachment either wholly or to such 
extent as it thinks fit; or 
(b) disallow the claim or objection; or 
(c) continue the attachment subject to any mortgage, charge or other interest in favour of any 
person; or 
(d) pass such order as in the circumstances of the case it deems fit. 
(4) Where any claim or objection has been adjudicated upon under this rule, order made thereon shall 
have the same force and be subject to the same conditions as to appeal or otherwise as if it were a decree. 
(5) Where a claim or an objection is preferred and the Court, under the proviso to sub-rule (1), refuses 
to entertain it, the party against whom such order is made may institute a suit to establish the right which 
he claims to the property in dispute; but, subject to the result of such-suit, if any, an order so refusing to 
entertain the claim or objection shall be conclusive.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-59', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 59 — Stay of sale', 'Rule 59. Stay of sale
Where before the claim was preferred or the objection was made, the property 
attached had already been advertised for sale, the Court may—  
(a) if the property is movable, make an order postponing the sale pending the adjudication of the 
claim or objection, or 
(b) if the property is immovable, make an order that, pending the adjudication of the claim or 
objection, the property shall not be sold, or that pending such adjudication, the property may be sold 
but the sale shall not be confirmed, 
and any such order may be made subject to such terms and conditions as to security or otherwise as the 
Court thinks fit.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-60', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 60 — [Release of property from attachment.] Omitted by the Code of Civil Procedure (Amendment)             
Act, 1976 (104 of 1976), s', 'Rule 60. [Release of property from attachment.] Omitted by the Code of Civil Procedure (Amendment)             
Act, 1976 (104 of 1976), s
72 (w.e.f. 1-2-1977).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-61', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 61 — [Disallowance of claim to property attached.] Omitted by s', 'Rule 61. [Disallowance of claim to property attached.] Omitted by s
72, ibid. (w.e.f. 1-2-1977).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-62', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 62 — [Continuance of attachment subject to claim of incumbrancer.] Omitted by s', 'Rule 62. [Continuance of attachment subject to claim of incumbrancer.] Omitted by s
72, ibid.                     
(w.e.f. 1-2-1977).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-63', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 63 — [Saving of suits to establish right to attached property.] Omitted by s', 'Rule 63. [Saving of suits to establish right to attached property.] Omitted by s
72, ibid. (w.e.f. 1-2-1977).] 
 
 

 
 
 
Sale generally') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-64', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 64 — Power to order property attached to be sold and proceeds to be paid to person entitled', 'Rule 64. Power to order property attached to be sold and proceeds to be paid to person entitled
Any 
Court executing a decree may order that any property attached by it and liable to sale, or such portion 
thereof as may see necessary to satisfy the decree, shall be sold, and that the proceeds of such sale, or a 
sufficient portion thereof, shall be paid to the party entitled under the decree to receive the same.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-65', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 65 — Sales by whom conducted and how made', 'Rule 65. Sales by whom conducted and how made
Save as otherwise prescribed, every sale in 
execution of a decree shall be conducted by an officer of the Court or by such other person as the Court 
may appoint in this behalf, and shall be made by public auction in manner prescribed.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-66', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 66 — Proclamation of sales by public auction', 'Rule 66. Proclamation of sales by public auction
(1) Where any property is ordered to be sold by 
public auction in execution of a decree, the Court shall cause a proclamation of the intended sale to be 
made in the language of such Court. 
(2) Such proclamation shall be drawn up after notice to the decree-holder and the judgment-debtor 
and shall state the time and place of sale, and specify as fairly and accurately as possible—  
(a) the property to be sold 1[or, where a part of the property would be sufficient to satisfy the 
decree, such part]; 
(b) the revenue assessed upon the estate or past of the estate, where the property to be sold is an 
interest in an estate or in part of an estate paying revenue to the Government; 
(c) any incumbrance to which the property is liable; 
(d) the amount for the recovery of which the sale is ordered; and 
(e) every other thing which the Court considers material for a purchaser to know in order to judge 
of the nature and value of the property: 
1[Provided that where notice of the date for settling the terms of the proclamation has been given to 
the judgment-debtor by means of an order under rule 54, it shall not be necessary to give notice under this 
rule to the judgment-debtor unless the Court otherwise directs: 
Provided further that nothing in this rule shall be construed as requiring the Court to enter in the 
proclamation of sale its own estimate of the value of the property, but the proclamation shall include the 
estimate, if any, given, by either or both of the Parties.] 
 (3) Every application for an order for sale under this rule shall be accompanied by a statement signed 
and verified in the manner hereinbefore prescribed for the signing and verification of pleadings and 
containing, so far as they are known to or can be ascertained by the person making the verification, the 
matters required by sub-rule (2) to be specified in the proclamation. 
(4) For the purpose of ascertaining the matters to be specified in the proclamation, the Court may 
summon any person whom it thinks necessary to summon and may examine him in respect to any such 
matters and require him to produce any document in his possession or power relating thereto.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-67', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 67 — Mode of making proclamation', 'Rule 67. Mode of making proclamation
(1) Every proclamation shall be made and published, as nearly 
as may be, in the manner prescribed by rule 54, sub-rule (2). 
(2) Where the Court so directs, such proclamation shall also be published in the Official Gazette or in 
a local newspaper, or in both, and the costs of such publication shall be deemed to be costs of the sale. 
(3) Where property is divided into lots for the purpose of being sold separately, it shall not be necessary 
to make a separate proclamation for each lot, unless proper notice of the sale cannot, in the opinion of the 
Court, otherwise be given.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-68', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 68 — Time of sale', 'Rule 68. Time of sale
Save in the case of property of the kind described in the proviso to rule 43, no sale 
hereunder shall, without the consent in writing of the judgment-debtor, take place until after the 
expiration of at least 1[fifteen days] in the case of immovable property, and of at least 2[seven days] in the 
case of movable property, calculated from the date on which the copy of the proclamation has been 
affixed on the Court-house of the Judge ordering the sale.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-69', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 69 — Adjournment or stoppage of sale', 'Rule 69. Adjournment or stoppage of sale
(1) The Court may, in its discretion, adjourn any sale 
hereunder to a specified day and hour, and the officer conducting any such sale may in his discretion 
adjourn the sale, recording his reasons for such adjournment: 
Provided that, where the sale is made in, or within the precincts of, the Court-house, no such 
adjournment shall be made without the leave of the Court. 
(2) Where a sale is adjourned under sub-rule (1) for a longer period than 3[thirty] days afresh 
proclamation under rule 67 shall be made, unless the judgment-debtor consents to waive it. 
(3) Every sale shall be stopped if, before the lot is knocked down, the debt and costs (including the 
costs of the sale) are tendered to the officer conducting the sale, or proof is given to his satisfaction that 
the amount of such debt and costs has been paid into the Court which ordered the sale.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-70', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 70 — [Saving of certain sales.] Omitted by the Code of Civil Procedure (Amendment) Act, 1956                     
(66 of 1956), s', 'Rule 70. [Saving of certain sales.] Omitted by the Code of Civil Procedure (Amendment) Act, 1956                     
(66 of 1956), s
14 (w.e.f. 1-1-1957).') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-71', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 71 — Defaulting purchaser answerable for loss on re-sale', 'Rule 71. Defaulting purchaser answerable for loss on re-sale
Any deficiency of price which may 
happen on a re-sale by reason of the purchaser’s default, and all expenses attending such re-sale, shall be 
certified to the Court 4*** by the officer or other person holding the sale, and shall, at the instance of 
either the decree-holder or the judgment-debtor, be recoverable from the defaulting purchaser under the 
provisions relating to the execution of a decree for the payment of money.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-72', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 72 — Decree-holder not to bid for or buy property without permission', 'Rule 72. Decree-holder not to bid for or buy property without permission
(1) No holder of a decree 
in execution of which property is sold shall, without the express permission of the Court, bid for or 
purchase the property. 
(2) Where decree-holder purchases, amount of decree may be taken as payment.—Where a 
decree-holder purchases with such permission, the purchase-money and the amount due on the decree 
may, subject to the provisions of section 73, be set off against one another, and the Court executing the 
decree shall enter up satisfaction of the decree in whole or in part accordingly. 
 (3) Where a decree-holder purchases, by himself or through another person, without such permission, 
the Court may, if it thinks fit, on the application of the judgment-debtor or any other person whose interests 
are affected by the sale, by order set aside the sale; and the costs of such application and order, and any 
deficiency of price which may happen on the re-sale and all expenses attending it, shall be paid by the       
decree-holder.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-72A', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 72A — Mortgagee not to bid at sale without the leave of the Court', 'Rule 72A. Mortgagee not to bid at sale without the leave of the Court
(1) Notwithstanding anything 
contained in rule 72, a mortgagee of immovable property shall not bid for or purchase property sold in 
execution of a decree on the mortgage unless the Court grants him leave to bid for or purchase the property. 
(2) If leave to bid is granted to such mortgagee, then the Court shall fix a reserve price as regards the 
mortgagee, and unless the Court otherwise directs, the reserve price shall be—  
(a) not less than the amount then due for principal, interest and costs in respect of the mortgage if 
the property is sold in one lot; and 
(b) in the case of any property sold in lots, not less than such sum as shall appear to the Court to 
be properly attributable to each lot in relation to the amount then due for principal, interest and costs 
on the mortgage.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-73', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 73 — Restriction on bidding or purchase by officers', 'Rule 73. Restriction on bidding or purchase by officers
No officer or other person having any duty to 
perform in connection with any sale shall, either directly or indirectly, bid for, acquire or attempt to 
acquire any interest in the property sold. 
Sale of movable property') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-74', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 74 — Sale of agricultural produce', 'Rule 74. Sale of agricultural produce
(1) Where the property to be sold is agricultural produce, the sale 
shall be held,—  
(a) if such produce is a growing crop, on or near the land on which such crop has grown, or 
(b) if such produce has been cut or gathered, at or near-the threshing floor or place for trading out 
grain or the like or fodder-stack on or in which it is deposited: 
Provided that the Court may direct the sale to be held at the nearest place of public resort, if it is of 
opinion that the produce is thereby likely to sell to greater advantage. 
(2) Where, on the produce being put up for sale,—  
(a) a fair price, in the estimation of the person holding the sale, is not offered for it, and 
(b) the owner of the produce or a person authorized to act in his behalf applies to have the sale 
postponed till next day or, if a market is held at the place of sale, the next market-day, 
the sale shall be postponed accordingly and shall be then completed, whatever price may be offered for 
the produce.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-75', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 75 — Special provisions relating to growing crops', 'Rule 75. Special provisions relating to growing crops
(1) Where the property to be sold is a growing crop 
and the crop from its nature admits of being stored but has not yet been stored, the day of the sale shall be so 
fixed as to admit of its being made ready for storing before the arrival of such day, and the sale shall not be 
held until the crop has been cut or gathered and is ready for storing. 
(2) Where the crop from its nature does not admit of being stored, it may be sold before it is cut and 
gathered, and the purchaser shall be entitled to enter on the land, and to do all that is necessary for the 
purpose of tending and cutting or gathering it.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-76', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 76 — Negotiable instruments and shares in corporations', 'Rule 76. Negotiable instruments and shares in corporations
Where the property to be sold is a 
negotiable instrument or a share in a corporation, the Court may, instead of directing the sale to be made 
by public auction, authorized the sale of such instrument or share through a broker.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-77', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 77 — Sale by public auction', 'Rule 77. Sale by public auction
(1) Where movable property is sold by public auction the price of each 
lot shall be paid at the time of sale or as soon after as the officer or other person holding the sale directs, 
and in default of payment the property shall forthwith be re-sold. 
(2) On payment of the purchase-money, the officer or other person holding the sale shall grant a 
receipt for the same, and the sale shall become absolute. 
(3) Where the movable property to be sold is a share in goods belonging to the judgment-debtor and a 
co-owner, and two or more persons, of whom one is such co-owner, respectively bid the same sum for 
such property or for any lot, the bidding shall be deemed to be the bidding of the co-owner.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-78', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 78 — Irregularity not to vitiate sale, but any person injured may sue', 'Rule 78. Irregularity not to vitiate sale, but any person injured may sue
No irregularity in publishing 
or conducting the sale of movable property shall vitiate the sale; but any person sustaining any injury by 
reason of such irregularity at the hand of any other person may institute a suit against him for compensation 
or (if such other person is the purchaser) for the recovery of the specific property and for compensation in 
default of such recovery.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-79', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 79 — Delivery of movable property, debts and shares', 'Rule 79. Delivery of movable property, debts and shares
(1) Where the property sold is movable 
property of which actual seizure has been made, it shall be delivered to the purchaser. 
 

 
 
 
 
(2) Where the property sold is movable property in the possession of some person other than the 
judgment-debtor, the delivery thereof to the purchaser shall be made by giving notice to the person in 
possession prohibiting him from delivering possession of the property to any person except the purchaser. 
(3) Where the property sold is a debt not secured by a negotiable instrument, or is a share in a 
corporation, the delivery thereof shall be made by a written order of the Court prohibiting the creditor 
from receiving the debt or any interest thereon, and the debtor from making payment thereof to any 
person except the purchaser, or prohibiting the person in whose name the share, may be standing from 
making any transfer of the share to any person except the purchaser, or receiving payment of any 
dividend or interest thereon, and the manager, secretary or other proper officer of the corporation from 
permitting any such transfer or making any such payment to any person except the purchaser.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-80', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 80 — Transfer of negotiable instruments and shares', 'Rule 80. Transfer of negotiable instruments and shares
(1) Where the execution of a document or the 
endorsement of the party in whose name a negotiable instrument or a share in a corporation is standing is 
required to transfer such negotiable instrument or, share the Judge or such officer as he may appoint in 
this behalf may execute such document or make such endorsement as may be necessary, and such 
execution or endorsement shall have the same effect as an execution or endorsement by the party. 
(2) Such execution or endorsement may be in the following form, namely:— 
A. B. by C.D. Judge of the Court of (or as the case may be), in a suit by E. F. against A.B. 
(3) Until the transfer of such negotiable instrument or share, the Court may, by order, appoint some 
person to receive any interest or dividend due thereon and to sign a receipt for the same; and any receipt 
so signed shall be as valid and effectual for all purposes as if the same had been signed by the party 
himself.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-81', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 81 — Vesting order in case of other property', 'Rule 81. Vesting order in case of other property
In the case of any movable property not hereinbefore 
provided for, the Court may make an order vesting such property in the purchaser or as he may direct; and 
such property shall vest accordingly. 
Sale of immovable property') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-82', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 82 — What Court may order sales', 'Rule 82. What Court may order sales
Sales of immovable property in execution of decrees may be 
ordered by any Court other than a Court of Small Causes.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-83', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 83 — Postponement of sale to enable judgment-debtor to raise amount of decree', 'Rule 83. Postponement of sale to enable judgment-debtor to raise amount of decree
(1) Where an 
order for the sale of immovable property has been made, if the judgment-debtor can satisfy the Court that 
there is reason to believe that the amount of the decree may be raised by the mortgage or lease or private 
sale of such property, or some part thereof, or of any other immovable property of the judgment-debtor, 
the Court may, on his application, postpone the sale of the property comprised in the order for sale on 
such terms and for such period as it thinks proper, to enable him to raise the amount. 
(2) In such case the Court shall grant a certificate to the judgment-debtor authorizing him within a 
period to be mentioned therein, and notwithstanding anything contained in section 64, to make the 
proposed mortgage, lease or sale: 
Provided that all moneys payable under such mortgage, lease or sale shall be paid, not to the 
judgment-debtor, but, save in so far as a decree-holder is entitled to set-off such money under the 
provisions of rule 72, into Court: 
Provided also that not mortgage, lease or sale under this rule shall become absolute until it has been 
confirmed by the Court. 
(3) Nothing in this rule shall be deemed to apply to a sale of property directed to be sole in execution 
of a decree for sale in enforcement of a mortgage of, or charge on, such property.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-84', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 84 — Deposit by purchaser and re-sale on default', 'Rule 84. Deposit by purchaser and re-sale on default
(1) On every sale of immovable property the 
person declared to be the purchaser shall pay immediately after such declaration a deposit of twenty-five 
per cent. on the amount of his purchase-money to the officer or other person conducting the sale, and in 
default of such deposit, the property shall forthwith be re-sold. 
(2) Where the decree-holder is the purchaser and is entitled to set-off the purchase-money under              
rule 72, the Court may dispense with the requirements of this rule.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-85', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 85 — Time for payment in full of purchase money', 'Rule 85. Time for payment in full of purchase money
The full amount of purchase-money payable 
shall be paid by the purchaser into Court before the Court closes on the fifteenth day from the sale of the 
property: 
Provided that, in calculating the amount to be so paid into Court, the purchaser shall have the 
advantage of any set-off to which he may be entitled under rule 72.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-86', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 86 — Procedure in default of payment', 'Rule 86. Procedure in default of payment
In default of payment within the period mentioned in the 
last preceding rule, the deposit may, if the Court thinks fit, after defraying the expenses of the sale, be 
forfeited to the Government, and the property shall be re-sold, and the defaulting purchaser shall forfeit 
all claim to the property or to any part of the sum for which it may subsequently be sold.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-87', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 87 — Notification on re-sale', 'Rule 87. Notification on re-sale
Every re-sale of immovable property, in default of payment of the 
purchase-money within the period allowed for such payment, shall be made after the issue of fresh 
proclamation in the manner and for the period hereinbefore prescribed for the sale.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-88', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 88 — Bid of co-sharer to have preference', 'Rule 88. Bid of co-sharer to have preference
Where the property sold is a share of undivided 
immovable property and two or more persons, of whom one is a co-sharer, respectively bid the same sum 
for such property or for any lot, the bid shall be deemed to be the bid of the co-sharer.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-89', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 89 — Application to set aside sale on deposit', 'Rule 89. Application to set aside sale on deposit
(1) Where immovable property has been sold in 
execution of a decree, 1[any person claiming an interest in the property sold at the time of the sale or at 
the time of making the application, or acting for or in the interest of such person,] may apply to have the 
sale set aside on his depositing in Court,— 
(a) for payment to the purchaser, a sum equal to five per cent. of the purchase-money, and 
(b) for payment, to the decree-holder, the amount specified in the proclamation of sale as that for 
the recovery of which the sale was ordered, less any amount which may, since the date of such 
proclamation of sale, have been received by the decree-holder. 
(2) Where a person applies under rule 90 to set aside the sale of his immovable property, he shall not, 
unless he withdraws his application, be entitled to make or prosecute an application under this rule. 
(3) Nothing in this rule shall relieve the judgment-debtor from any liability he may be under in 
respect of costs and interest not covered by the proclamation of sale.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-90', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 90 — Application to set aside sale on ground of irregularity or fraud', 'Rule 90. Application to set aside sale on ground of irregularity or fraud
(1) Where any immovable 
property has been sold in execution of a decree, the decree-holder, or the purchaser, or any other person 
entitled to share in a rateable distribution of assets, or whose interests are affected by the sale, may apply to 
the Court to set aside the sale on the ground of a material irregularity or fraud in publishing or conducting it. 
(2) No sale shall be set aside on the ground of irregularity or fraud in publishing or conducting it 
unless, upon the facts proved, the Court is satisfied that the applicant has sustained substantial injury by 
reason of such irregularity or fraud. 
(3) No application to set aside a sale under this rule shall be entertained upon any ground which the 
applicant could have taken on or before the date on which the proclamation of sale was drawn up. 
Explanation.—The mere absence of, or defect in, attachment of the property sold shall not, by itself, 
be a ground for setting aside a sale under this rule.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-91', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 91 — Application by purchaser to set aside sale on ground of judgment-debtor having no saleable 
interest', 'Rule 91. Application by purchaser to set aside sale on ground of judgment-debtor having no saleable 
interest
The purchaser at any such sale in execution of a decree may apply to the Court to set aside the 
sale, on the ground that the judgment-debtor had no saleable interest in the property sold.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-92', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 92 — Sale when to become absolute or be set aside', 'Rule 92. Sale when to become absolute or be set aside
(1) Where no application is made under rule 89, 
rule 90 or rule 91, or where such application is made and disallowed, the Court shall make an order 
confirming the sale, and thereupon the sale shall become absolute: 
 

 
 
 
1[Provided that, where any property is sold in execution of a decree pending the final disposal of any 
claim to, or any objection to the attachment of, such property, the Court shall not confirm such sale until 
the final disposal of such claim or objection.] 
(2) Where such application is made and allowed, and where, in the case of an application-under                     
rule 89, the deposit required by that rule is made within 2[sixty days] from the date of sale, 3[or in cases 
where the amount deposited under rule 89 is found to be deficient owing to any clerical or arithmetical 
mistake on the part of the depositor and such deficiency has been made good within such time as may be 
fixed by the Court, the Court shall make an order setting aside the sale]: 
Provided that no order shall be made unless notice of the application has been given to all persons 
affected thereby: 
4[Provided further that the deposit under this sub-rule may be made within sixty days in all such cases 
where the period of thirty days, within which the deposit had to be made, has not expired before the 
commencement of the Code of Civil Procedure (Amendment) Act, 2002 (22 of 2002).] 
(3) No suit to set aside an order made under this rule shall be brought by any person against whom 
such order is made. 
5[(4) Where a third party challenges the judgment-debtor’s title by filing a suit against the                    
auction-purchaser, the decree-holder and the judgment-debtor shall be necessary parties to the suit. 
(5) If the suit referred to in sub-rule (4) is decreed, the Court shall direct the decree-holder to refund 
the money to the auction-purchaser, and where such an order is passed the execution proceeding in which 
the sale had been held shall, unless the Court otherwise directs, be revived at the stage at which the sale 
was ordered.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-93', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 93 — Return of purchaser-money in certain cases', 'Rule 93. Return of purchaser-money in certain cases
Where a sale of immovable property is set aside 
under rule 92, the purchaser shall be entitled to an order for repayment of his purchase-money, with or 
without interest as the Court may direct, against any person to whom it has been paid.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-94', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 94 — Certificate to purchaser', 'Rule 94. Certificate to purchaser
Where a sale of immovable property has become absolute, the Court 
shall grant a certificate specifying the property sold and the name of the person who at the time of sale is 
declared to be the purchaser. Such certificate shall bear date the day on which the sale became absolute.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-95', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 95 — Delivery of property in occupancy of judgment-debtor—Where the immovable property sold 
is in the occupancy of the judgment-debtor or of some person on his behalf or of some person claiming 
under a title created by the judgment-debtor subsequently to the attachment of such property and a 
certificate in respect thereof has been granted under rule 94, the Court shall, on the application of the 
purchaser, order delivery to be made by putting such purchaser or any person whom he may appoint to 
receive delivery on his behalf in possession of the property, and, if need be, by removing any person who 
refuses to vacate the same', 'Rule 95. Delivery of property in occupancy of judgment-debtor—Where the immovable property sold 
is in the occupancy of the judgment-debtor or of some person on his behalf or of some person claiming 
under a title created by the judgment-debtor subsequently to the attachment of such property and a 
certificate in respect thereof has been granted under rule 94, the Court shall, on the application of the 
purchaser, order delivery to be made by putting such purchaser or any person whom he may appoint to 
receive delivery on his behalf in possession of the property, and, if need be, by removing any person who 
refuses to vacate the same
') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-96', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 96 — Delivery of property in occupancy of tenant', 'Rule 96. Delivery of property in occupancy of tenant
Where the property sold is in the occupancy of a 
tenant or other person entitled to occupy the same and a certificate in respect thereof has been granted 
under rule 94, the Court shall, on the application of the purchaser, order delivery to be made by affixing a 
copy of the certificate of sale in some conspicuous place on the property, and proclaiming to the occupant 
by beat of drum or other customary mode, at some convenient place, that the interest of the                    
judgment-debtor has been transferred to the purchaser. 
Resistance of delivery of possession to decree-holder or purchaser') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-97', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 97 — Resistance or obstruction to possession of immovable property', 'Rule 97. Resistance or obstruction to possession of immovable property
(1) Where the holder of a 
decree for the possession of immovable property or the purchaser of any such property sold in execution 
of a decree is resisted or obstructed by any person in obtaining possession of the property, he may make 
an application to the Court complaining of such resistance or obstruction. 
6[(2) Where any application is made under sub-rule (1), the Court shall proceed to adjudicate upon the 
application in accordance with the provisions herein contained.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-98', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 98 — Orders after adjudication', 'Rule 98. Orders after adjudication
(1) Upon the determination of the questions referred to in                     
rule 101, the Court shall, in accordance with such determination and subject to the provisions of                     
sub-rule (2),—  
(a) make an order allowing the application and directing that the applicant be put into the 
possession of the property or dismissing the application; or 
(b) pass such other order as, in the circumstances of the case, it may deem fit. 
(2) Where, upon such determination, the Court is satisfied that the resistance or obstruction was 
occasioned without any just cause by the judgment-debtor or by some other person at his instigation or on 
his behalf, or by any transferee, where such transfer was made during the pendency of the suit or 
execution proceeding, it shall direct that the applicant be put into possession of the property, and where 
the applicant is still resisted or obstructed in obtaining possession, the Court may also, at the instance of 
the applicant, order the judgment-debtor, or any person acting at his instigation or on his behalf, to be 
detained in the civil prison for a term which may extend to thirty days.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-99', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 99 — Dispossession by decree-holder or purchaser', 'Rule 99. Dispossession by decree-holder or purchaser
(1) Where any person other than the                     
judgment-debtor is dispossessed of immovable property by the holder of a decree for the possession of 
such property or, where such property has been sold in execution of a decree, by the purchaser thereof, he 
may make an application to the Court complaining of such dispossession. 
(2) Where any such application is made, the Court shall proceed to adjudicate upon the application in 
accordance with the provisions herein contained.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-100', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 100 — Order to be passed upon application complaining of dispossession', 'Rule 100. Order to be passed upon application complaining of dispossession
Upon the determination of 
the questions referred to in rule 101, the Court shall, in accordance with such determination,— 
(a) make an order allowing the application and directing that the applicant be put into the 
possession of the property or dismissing the application; or 
(b) pass such other order as, in the circumstances of the case, it may deem fit.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-101', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 101 — Question to be determined', 'Rule 101. Question to be determined
All questions (including questions relating to right, title or 
interest in the property) arising between the parties to a proceeding on an application under rule 97 or         
rule 99 or their representatives, and relevant to the adjudication of the application, shall be determined by 
the Court dealing with the application and not by a separate suit and for this purpose, the Court shall, 
notwithstanding anything to the contrary contained in any other law for the time being in force, be 
deemed to have jurisdiction to decide such questions.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-102', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 102 — Rules not applicable to transferee pendente lite', 'Rule 102. Rules not applicable to transferee pendente lite
Nothing in rules 98 and 100 shall apply to 
resistance or obstruction in execution of a decree for the possession of immovable property by a person to 
whom the judgment-debtor has transferred the property after the institution of the suit in which the decree 
was passed or to the dispossession of any such person. 
Explanation.—In this rule, “transfer” includes a transfer by operation of law.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-103', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 103 — Orders to be treated as decrees', 'Rule 103. Orders to be treated as decrees
Where any application has been adjudicated upon under                
rule 98 or rule 100, the order made thereon shall have the same force and be subject to the same 
conditions as to an appeal or otherwise as if it were a decree.]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-104', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 104 — Orders under rule 101 or rule 103 to be subject to the result or pending suit', 'Rule 104. Orders under rule 101 or rule 103 to be subject to the result or pending suit
Every order 
made under rule 101 or rule 103 shall subject to the result of any suit that may be pending on the date of 
commencement of the proceeding in which such order, is made if in such suit the party against whom the 
order under rule 101 or rule 103 is made has sought to establish a right which he claims to the present 
possession of the property.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-105', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 105 — Hearing of application', 'Rule 105. Hearing of application
(1) The Court, before which an application under any of the 
foregoing rules of this Order is pending, may fix a day for the hearing of the application. 
(2) Where on the day fixed or on any other day to which the hearing may be adjourned the applicant 
does not appear when the case is called on for hearing, the Court may make an order that the application 
be dismissed. 
 
 

 
 
 
(3) Where the applicant appears and the opposite party to whom the notice has been issued by the 
Court does not appear, the Court may hear the application ex parte and pass such order as it thinks fit. 
Explanation.—An application referred to in sub-rule (1) includes a claim or objection made under      
rule 58.') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;
INSERT INTO pageindex_nodes (node_id, snapshot_id, parent_id, node_type, label, text_content) VALUES ('CPC-1908/ORD-XXI/R-106', 'CPC-1908_2026-06-11', 'CPC-1908/ORD-XXI', 'section', 'Rule 106 — Setting aside orders passed ex parte, etc', 'Rule 106. Setting aside orders passed ex parte, etc
(1) The applicant, against whom an order is made 
under sub-rule (2) of rule 105 or the opposite party against whom an order is passed ex parte under                     
sub-rule (3) of that rule or under sub-rule (1) of rule 23, may apply to the Court to set aside the order, and 
if he satisfies the Court that there was sufficient cause for his non-appearance whom the application was 
called on for hearing, the Court shall set aside the order or such terms as to costs or otherwise as it thinks 
fit, and shall appoint a day for the further hearing of the application. 
(2) No order shall be made on an application under sub-rule (1) unless notice of the application has 
been served on the other party. 
(3) An application under sub-rule (1) shall be made within thirty days from the date of the order, or 
where, in the case of an ex parte order, the notice was not duly served, within thirty days from the date 
when applicant had knowledge of the order.] 
Uttar Pradesh 
Amendment of Order XXI.— In the First Schedule, in Order XXI, rule 104, rule 105 
and rule 106 as inserted by Allahabad High Court shall be re-numbered as rule 106-A, 
rule 106-B and rule 106-C respectively. 
[Vide Uttar Pradesh Act 57 of 1976, s. 10]') ON CONFLICT (node_id, snapshot_id) DO UPDATE SET text_content = EXCLUDED.text_content, label = EXCLUDED.label;