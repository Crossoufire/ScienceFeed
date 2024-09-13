from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import secrets

import feedparser
from flask import current_app
from sqlalchemy import or_
from sqlalchemy.orm import joinedload, contains_eager

from backend.api.app import db
from backend.api.email import send_feed_email
from backend.api.models import RssFeed, User, Article, UserArticle, Keyword, UserRssFeed
from backend.api.utils import find_matching_keywords_regex, clean_html_with_regex


def add_new_user(username: str, email: str):
    """ Add a new user to the database """

    new_password = secrets.token_hex(6)

    user = User.query.filter(or_(User.username == username, User.email == email)).first()
    if user:
        raise Exception("This username/email is already taken")

    user = User(
        username=username,
        email=email,
        password=new_password,
        registered_on=datetime.utcnow(),
        active=True,
    )
    db.session.add(user)
    db.session.commit()

    print(f"User {username} created and activated with password: {new_password}")


def seed_database():
    """ Seed the database with RSS Feeds """

    current_app.logger.info("###############################################################################")
    current_app.logger.info("[SYSTEM] - Adding RSS Feeds -")

    RSS_FEEDS = [
        {"publisher": "ACS", "journal": "Accounts of Chemical Research", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=achre4"},
        {"publisher": "ACS", "journal": "Accounts of Materials Research", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amrcda"},
        {"publisher": "ACS", "journal": "ACS Agricultural Science & Technology", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aastgj"},
        {"publisher": "ACS", "journal": "ACS Applied Bio Materials", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aabmcb"},
        {"publisher": "ACS", "journal": "ACS Applied Electronic Materials", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaembp"},
        {"publisher": "ACS", "journal": "ACS Applied Energy Materials", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaemcq"},
        {"publisher": "ACS", "journal": "ACS Applied Engineering Materials", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaemdr"},
        {"publisher": "ACS", "journal": "ACS Applied Materials & Interfaces", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aamick"},
        {"publisher": "ACS", "journal": "ACS Applied Nano Materials", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aanmf6"},
        {"publisher": "ACS", "journal": "ACS Applied Optical Materials", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aaoma6"},
        {"publisher": "ACS", "journal": "ACS Applied Polymer Materials", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aapmcd"},
        {"publisher": "ACS", "journal": "ACS Bio & Med Chem Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=abmcb8"},
        {"publisher": "ACS", "journal": "ACS Biomaterials Science & Engineering", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=abseba"},
        {"publisher": "ACS", "journal": "ACS Catalysis", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=accacs"},
        {"publisher": "ACS", "journal": "ACS Central Science", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=acscii"},
        {"publisher": "ACS", "journal": "ACS Chemical Biology", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=acbcct"},
        {"publisher": "ACS", "journal": "ACS Chemical Health & Safety", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=achsc5"},
        {"publisher": "ACS", "journal": "ACS Chemical Neuroscience", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=acncdm"},
        {"publisher": "ACS", "journal": "ACS Earth and Space Chemistry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aesccq"},
        {"publisher": "ACS", "journal": "ACS Energy Letters", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aelccp"},
        {"publisher": "ACS", "journal": "ACS Engineering Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aeacb3"},
        {"publisher": "ACS", "journal": "ACS Environmental Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aeacc4"},
        {"publisher": "ACS", "journal": "ACS ES&T Air", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aeacd5"},
        {"publisher": "ACS", "journal": "ACS ES&T Engineering", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aeecco"},
        {"publisher": "ACS", "journal": "ACS ES&T Water", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aewcaa"},
        {"publisher": "ACS", "journal": "ACS Food Science & Technology", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=afsthl"},
        {"publisher": "ACS", "journal": "ACS Infectious Diseases", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aidcbc"},
        {"publisher": "ACS", "journal": "ACS Macro Letters", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amlccd"},
        {"publisher": "ACS", "journal": "ACS Materials Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amacgu"},
        {"publisher": "ACS", "journal": "ACS Materials Letters", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amlcef"},
        {"publisher": "ACS", "journal": "ACS Measurement Science Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amachv"},
        {"publisher": "ACS", "journal": "ACS Medicinal Chemistry Letters", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=amclct"},
        {"publisher": "ACS", "journal": "ACS Nano", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ancac3"},
        {"publisher": "ACS", "journal": "ACS Nanoscience Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=anaccx"},
        {"publisher": "ACS", "journal": "ACS Omega", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=acsodf"},
        {"publisher": "ACS", "journal": "ACS Organic & Inorganic Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aoiab5"},
        {"publisher": "ACS", "journal": "ACS Pharmacology & Translational Science", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=aptsfn"},
        {"publisher": "ACS", "journal": "ACS Photonics", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=apchd5"},
        {"publisher": "ACS", "journal": "ACS Physical Chemistry Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=apcach"},
        {"publisher": "ACS", "journal": "ACS Polymers Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=apaccd"},
        {"publisher": "ACS", "journal": "ACS Sensors", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ascefj"},
        {"publisher": "ACS", "journal": "ACS Sustainable Chemistry & Engineering", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ascecg"},
        {"publisher": "ACS", "journal": "ACS Sustainable Resource Management", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=asrmcd"},
        {"publisher": "ACS", "journal": "ACS Synthetic Biology", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=asbcd6"},
        {"publisher": "ACS", "journal": "Analytical Chemistry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ancham"},
        {"publisher": "ACS", "journal": "Artificial Photosynthesis", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=apwdam"},
        {"publisher": "ACS", "journal": "Biochemistry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=bichaw"},
        {"publisher": "ACS", "journal": "Bioconjugate Chemistry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=bcches"},
        {"publisher": "ACS", "journal": "Biomacromolecules", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=bomaf6"},
        {"publisher": "ACS", "journal": "Chem & Bio Engineering", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=cbehb5"},
        {"publisher": "ACS", "journal": "Chemical & Biomedical Imaging", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=cbihbp"},
        {"publisher": "ACS", "journal": "Chemical Research in Toxicology", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=crtoec"},
        {"publisher": "ACS", "journal": "Chemical Reviews", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=chreay"},
        {"publisher": "ACS", "journal": "Chemistry of Materials", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=cmatex"},
        {"publisher": "ACS", "journal": "Crystal Growth & Design", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=cgdefu"},
        {"publisher": "ACS", "journal": "Energy & Fuels", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=enfuem"},
        {"publisher": "ACS", "journal": "Environment & Health", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=ehnea2"},
        {"publisher": "ACS", "journal": "Environmental Science & Technology", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=esthag"},
        {"publisher": "ACS", "journal": "Environmental Science & Technology Letters", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=estlcu"},
        {"publisher": "ACS", "journal": "Industrial & Engineering Chemistry Research", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=iecred"},
        {"publisher": "ACS", "journal": "Inorganic Chemistry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=inocaj"},
        {"publisher": "ACS", "journal": "JACS Au", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jaaucr"},
        {"publisher": "ACS", "journal": "Journal of Agricultural and Food Chemistry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jafcau"},
        {"publisher": "ACS", "journal": "Journal of the American Chemical Society", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jacsat"},
        {"publisher": "ACS", "journal": "Journal of the American Society for Mass Spectrometry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jamsef"},
        {"publisher": "ACS", "journal": "Journal of Chemical & Engineering Data", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jceaax"},
        {"publisher": "ACS", "journal": "Journal of Chemical Education", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jceda8"},
        {"publisher": "ACS", "journal": "Journal of Chemical Information and Modeling", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jcisd8"},
        {"publisher": "ACS", "journal": "Journal of Chemical Theory and Computation", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jctcce"},
        {"publisher": "ACS", "journal": "Journal of Medicinal Chemistry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jmcmar"},
        {"publisher": "ACS", "journal": "Journal of Natural Products", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jnprdf"},
        {"publisher": "ACS", "journal": "The Journal of Organic Chemistry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=joceah"},
        {"publisher": "ACS", "journal": "The Journal of Physical Chemistry A", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jpcafh"},
        {"publisher": "ACS", "journal": "The Journal of Physical Chemistry B", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jpcbfk"},
        {"publisher": "ACS", "journal": "The Journal of Physical Chemistry C", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jpccck"},
        {"publisher": "ACS", "journal": "The Journal of Physical Chemistry Letters", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jpclcd"},
        {"publisher": "ACS", "journal": "Journal of Proteome Research", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=jprobs"},
        {"publisher": "ACS", "journal": "Langmuir", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=langd5"},
        {"publisher": "ACS", "journal": "Macromolecules", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=mamobx"},
        {"publisher": "ACS", "journal": "Molecular Pharmaceutics", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=mpohbp"},
        {"publisher": "ACS", "journal": "Nano Letters", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=nalefd"},
        {"publisher": "ACS", "journal": "Organic Letters", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=orlef7"},
        {"publisher": "ACS", "journal": "Organic Process Research & Development", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=oprdfk"},
        {"publisher": "ACS", "journal": "Organometallics", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=orgnd7"},
        {"publisher": "ACS", "journal": "Precision Chemistry", "url": "https://pubs.acs.org/action/showFeed?type=axatoc&feed=rss&jc=pcrhej"},
        {"publisher": "RSC", "journal": "Analyst", "url": "http://feeds.rsc.org/rss/an"},
        {"publisher": "RSC", "journal": "Analytical Methods", "url": "http://feeds.rsc.org/rss/ay"},
        {"publisher": "RSC", "journal": "Biomaterials Science", "url": "http://feeds.rsc.org/rss/bm"},
        {"publisher": "RSC", "journal": "Catalysis Science & Technology", "url": "http://feeds.rsc.org/rss/cy"},
        {"publisher": "RSC", "journal": "Chemical Communications", "url": "http://feeds.rsc.org/rss/cc"},
        {"publisher": "RSC", "journal": "Chemical Science", "url": "http://feeds.rsc.org/rss/sc"},
        {"publisher": "RSC", "journal": "Chemical Society Reviews", "url": "http://feeds.rsc.org/rss/cs"},
        {"publisher": "RSC", "journal": "Chemistry Education Research and Practice", "url": "http://feeds.rsc.org/rss/rp"},
        {"publisher": "RSC", "journal": "CrystEngComm", "url": "http://feeds.rsc.org/rss/ce"},
        {"publisher": "RSC", "journal": "Dalton Transactions", "url": "http://feeds.rsc.org/rss/dt"},
        {"publisher": "RSC", "journal": "Digital Discovery", "url": "http://feeds.rsc.org/rss/dd"},
        {"publisher": "RSC", "journal": "EES Batteries", "url": "http://feeds.rsc.org/rss/eb"},
        {"publisher": "RSC", "journal": "EES Catalysis", "url": "http://feeds.rsc.org/rss/ey"},
        {"publisher": "RSC", "journal": "EES Solar", "url": "http://feeds.rsc.org/rss/el"},
        {"publisher": "RSC", "journal": "Energy & Environmental Science", "url": "http://feeds.rsc.org/rss/ee"},
        {"publisher": "RSC", "journal": "Energy Advances", "url": "http://feeds.rsc.org/rss/ya"},
        {"publisher": "RSC", "journal": "Environmental Science: Advances", "url": "http://feeds.rsc.org/rss/va"},
        {"publisher": "RSC", "journal": "Environmental Science: Atmospheres", "url": "http://feeds.rsc.org/rss/ea"},
        {"publisher": "RSC", "journal": "Environmental Science: Nano", "url": "http://feeds.rsc.org/rss/en"},
        {"publisher": "RSC", "journal": "Environmental Science: Processes & Impacts", "url": "http://feeds.rsc.org/rss/em"},
        {"publisher": "RSC", "journal": "Environmental Science: Water Research & Technology", "url": "http://feeds.rsc.org/rss/ew"},
        {"publisher": "RSC", "journal": "Faraday Discussions", "url": "http://feeds.rsc.org/rss/fd"},
        {"publisher": "RSC", "journal": "Food & Function", "url": "http://feeds.rsc.org/rss/fo"},
        {"publisher": "RSC", "journal": "Green Chemistry", "url": "http://feeds.rsc.org/rss/gc"},
        {"publisher": "RSC", "journal": "Industrial Chemistry & Materials", "url": "http://feeds.rsc.org/rss/im"},
        {"publisher": "RSC", "journal": "Inorganic Chemistry Frontiers", "url": "http://feeds.rsc.org/rss/qi"},
        {"publisher": "RSC", "journal": "Journal of Analytical Atomic Spectrometry", "url": "http://feeds.rsc.org/rss/ja"},
        {"publisher": "RSC", "journal": "Journal of Materials Chemistry A", "url": "http://feeds.rsc.org/rss/ta"},
        {"publisher": "RSC", "journal": "Journal of Materials Chemistry B", "url": "http://feeds.rsc.org/rss/tb"},
        {"publisher": "RSC", "journal": "Journal of Materials Chemistry C", "url": "http://feeds.rsc.org/rss/tc"},
        {"publisher": "RSC", "journal": "Lab on a Chip", "url": "http://feeds.rsc.org/rss/lc"},
        {"publisher": "RSC", "journal": "Materials Advances", "url": "http://feeds.rsc.org/rss/ma"},
        {"publisher": "RSC", "journal": "Materials Chemistry Frontiers", "url": "http://feeds.rsc.org/rss/qm"},
        {"publisher": "RSC", "journal": "Materials Horizons", "url": "http://feeds.rsc.org/rss/mh"},
        {"publisher": "RSC", "journal": "Molecular Omics", "url": "http://feeds.rsc.org/rss/mo"},
        {"publisher": "RSC", "journal": "Molecular Systems Design & Engineering", "url": "http://feeds.rsc.org/rss/me"},
        {"publisher": "RSC", "journal": "Nanoscale", "url": "http://feeds.rsc.org/rss/nr"},
        {"publisher": "RSC", "journal": "Nanoscale Advances", "url": "http://feeds.rsc.org/rss/na"},
        {"publisher": "RSC", "journal": "Nanoscale Horizons", "url": "http://feeds.rsc.org/rss/nh"},
        {"publisher": "RSC", "journal": "Natural Product Reports", "url": "http://feeds.rsc.org/rss/np"},
        {"publisher": "RSC", "journal": "New Journal of Chemistry", "url": "http://feeds.rsc.org/rss/nj"},
        {"publisher": "RSC", "journal": "Organic & Biomolecular Chemistry", "url": "http://feeds.rsc.org/rss/ob"},
        {"publisher": "RSC", "journal": "Organic Chemistry Frontiers", "url": "http://feeds.rsc.org/rss/qo"},
        {"publisher": "RSC", "journal": "Physical Chemistry Chemical Physics", "url": "http://feeds.rsc.org/rss/cp"},
        {"publisher": "RSC", "journal": "Polymer Chemistry", "url": "http://feeds.rsc.org/rss/py"},
        {"publisher": "RSC", "journal": "Reaction Chemistry & Engineering", "url": "http://feeds.rsc.org/rss/re"},
        {"publisher": "RSC", "journal": "RSC Advances", "url": "http://feeds.rsc.org/rss/ra"},
        {"publisher": "RSC", "journal": "RSC Applied Interfaces", "url": "http://feeds.rsc.org/rss/lf"},
        {"publisher": "RSC", "journal": "RSC Applied Polymers", "url": "http://feeds.rsc.org/rss/lp"},
        {"publisher": "RSC", "journal": "RSC Chemical Biology", "url": "http://feeds.rsc.org/rss/cb"},
        {"publisher": "RSC", "journal": "RSC Mechanochemistry", "url": "http://feeds.rsc.org/rss/mr"},
        {"publisher": "RSC", "journal": "RSC Medicinal Chemistry", "url": "http://feeds.rsc.org/rss/md"},
        {"publisher": "RSC", "journal": "RSC Pharmaceutics", "url": "http://feeds.rsc.org/rss/pm"},
        {"publisher": "RSC", "journal": "RSC Sustainability", "url": "http://feeds.rsc.org/rss/su"},
        {"publisher": "RSC", "journal": "Sensors & Diagnostics", "url": "http://feeds.rsc.org/rss/sd"},
        {"publisher": "RSC", "journal": "Soft Matter", "url": "http://feeds.rsc.org/rss/sm"},
        {"publisher": "RSC", "journal": "Sustainable Energy & Fuels", "url": "http://feeds.rsc.org/rss/se"},
        {"publisher": "RSC", "journal": "Sustainable Food Technology", "url": "http://feeds.rsc.org/rss/fb"},
        {"publisher": "APS", "journal": "Physical Review Letters", "url": "http://feeds.aps.org/rss/recent/prl.xml"},
        {"publisher": "APS", "journal": "Physical Review A", "url": "http://feeds.aps.org/rss/recent/pra.xml"},
        {"publisher": "APS", "journal": "Physical Review B", "url": "http://feeds.aps.org/rss/recent/prb.xml"},
        {"publisher": "APS", "journal": "Physical Review C", "url": "http://feeds.aps.org/rss/recent/prc.xml"},
        {"publisher": "APS", "journal": "Physical Review D", "url": "http://feeds.aps.org/rss/recent/prd.xml"},
        {"publisher": "APS", "journal": "Physical Review E", "url": "http://feeds.aps.org/rss/recent/pre.xml"},
        {"publisher": "AIP", "journal": "J. Chem. Phys.", "url": "https://pubs.aip.org/rss/site_1000043/1000024.xml"},
        {"publisher": "AIP", "journal": "Chem. Phys. Rev.", "url": "https://pubs.aip.org/rss/site_1000027/1000016.xml"},
        {"publisher": "Nature", "journal": "Nature", "url": "https://www.nature.com/nature.rss"},
        {"publisher": "Nature", "journal": "Nature Chem.", "url": "https://www.nature.com/nchem.rss"},
        {"publisher": "Nature", "journal": "Nature Comm.", "url": "https://www.nature.com/ncomms.rss"},
        {"publisher": "Science", "journal": "Science", "url": "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science"},
        {"publisher": "Wiley", "journal": "ChemPhotoChem", "url": "https://chemistry-europe.onlinelibrary.wiley.com/feed/23670932/most-recent"},
        {"publisher": "Wiley", "journal": "ChemPhysChem", "url": "https://chemistry-europe.onlinelibrary.wiley.com/feed/14397641/most-recent"},
        {"publisher": "Wiley", "journal": "J. Comp. Chem.", "url": "https://onlinelibrary.wiley.com/action/showFeed?jc=1096987x&type=etoc&feed=rss"},
        {"publisher": "Wiley", "journal": "WIREs", "url": "https://wires.onlinelibrary.wiley.com/action/showFeed?jc=17590884&type=etoc&feed=rss"},
        {"publisher": "Elsevier", "journal": "Dyes and Pigments", "url": "https://rss.sciencedirect.com/publication/science/01437208"},
        {"publisher": "Elsevier", "journal": "Chem. Phys.", "url": "https://rss.sciencedirect.com/publication/science/03010104"},
        {"publisher": "Elsevier", "journal": "Chem. Phys. Lett.", "url": "https://rss.sciencedirect.com/publication/science/00092614"},
        {"publisher": "Elsevier", "journal": "Comp. Theo. Chem.", "url": "https://rss.sciencedirect.com/publication/science/2210271X"},
        {"publisher": "Elsevier", "journal": "J. Photochem. Photobio.", "url": "https://rss.sciencedirect.com/publication/science/26664690"},
        {"publisher": "Elsevier", "journal": "J. Photochem. Photobio. C", "url": "https://rss.sciencedirect.com/publication/science/13895567"},
        {"publisher": "Elsevier", "journal": "J. Photochem. Photobio. A", "url": "https://rss.sciencedirect.com/publication/science/10106030"},
        {"publisher": "Elsevier", "journal": "J. Phys. Chem. Solids", "url": "https://rss.sciencedirect.com/publication/science/00223697"},
        {"publisher": "Elsevier", "journal": "Spectro. Acta B", "url": "https://rss.sciencedirect.com/publication/science/05848547"},
    ]

    for feed_dict in RSS_FEEDS:
        RssFeed.add_rss_feed(**feed_dict)
    db.session.commit()

    current_app.logger.info("[SYSTEM] - Finished Adding RSS Feeds -")
    current_app.logger.info("###############################################################################")


def fetch_and_filter_articles():
    current_app.logger.info("###############################################################################")
    current_app.logger.info("[SYSTEM] - Adding New Articles to Users Based on Keywords -")

    users = User.query.filter_by(active=True).options(
        joinedload(User.rss_feeds),
        joinedload(User.keywords.and_(Keyword.active == True))
    ).all()

    all_rss_feeds = (
        RssFeed.query.filter(
            RssFeed.id.in_(
                [user_rss_feed.rss_feed_id for user_rss_feed in UserRssFeed.query.all()]
            )
        ).all()
    )

    with ThreadPoolExecutor() as executor:
        all_feeds_parsed = dict(executor.map(
            lambda rss_feed: (rss_feed.id, {"feed_object": rss_feed, "feed_parsed": feedparser.parse(rss_feed.url)}),
            all_rss_feeds)
        )

    for user in users:
        keywords = [keyword for keyword in user.keywords if keyword.active]
        user_rss_feed_ids = [user_feed.rss_feed_id for user_feed in user.rss_feeds]

        for feed_id in user_rss_feed_ids:
            if feed_id in all_feeds_parsed:
                feed_parsed = all_feeds_parsed[feed_id]["feed_parsed"]
                rss_feed = all_feeds_parsed[feed_id]["feed_object"]

                for entry in feed_parsed.entries:
                    keywords_found = find_matching_keywords_regex([k.name for k in keywords], entry)
                    if not keywords_found:
                        continue

                    article = Article.query.filter_by(title=entry.title).first()
                    if not article:
                        article = Article(
                            rss_feed_id=rss_feed.id,
                            title=entry.title,
                            link=entry.link,
                            summary=clean_html_with_regex(entry.summary),
                        )
                        db.session.add(article)
                        db.session.flush()

                    user_article = UserArticle.query.filter_by(user_id=user.id, article_id=article.id).first()
                    if not user_article:
                        user_article = UserArticle(user_id=user.id, article_id=article.id)
                        db.session.add(user_article)

                    user_article.keywords.extend([k for k in keywords if k.name in keywords_found])

        db.session.commit()

    current_app.logger.info("[SYSTEM] - Finished Adding New Articles Based on Keywords -")
    current_app.logger.info("###############################################################################")


def fetch_and_filter_articles_one_user(user: User):
    current_app.logger.info("###############################################################################")
    current_app.logger.info(f"[SYSTEM] - Adding New Articles to User `{user.username}` Based on Keywords -")

    user_articles = user.articles
    all_user_rss_feeds = [user_feed.rss_feed for user_feed in user.rss_feeds]
    keywords = [keyword for keyword in user.keywords if keyword.active]

    with ThreadPoolExecutor() as executor:
        all_feeds_parsed = dict(executor.map(
            lambda rss_feed: (rss_feed.id, {"feed_object": rss_feed, "feed_parsed": feedparser.parse(rss_feed.url)}),
            all_user_rss_feeds)
        )

    for rss_feed in all_user_rss_feeds:
        if rss_feed.id in all_feeds_parsed:
            feed_parsed = all_feeds_parsed[rss_feed.id]["feed_parsed"]
            rss_feed = all_feeds_parsed[rss_feed.id]["feed_object"]

            for entry in feed_parsed.entries:
                keywords_found = find_matching_keywords_regex([k.name for k in keywords], entry)
                if not keywords_found:
                    continue

                article = Article.query.filter_by(title=entry.title).first()
                if not article:
                    article = Article(
                        rss_feed_id=rss_feed.id,
                        title=entry.title,
                        link=entry.link,
                        summary=clean_html_with_regex(entry.summary),
                    )
                    db.session.add(article)
                    db.session.flush()

                is_article_in_user_articles = False
                for user_article in user_articles:
                    if user_article.article_id == article.id:
                        is_article_in_user_articles = True
                        break

                if not is_article_in_user_articles:
                    user_article = UserArticle(user_id=user.id, article_id=article.id)
                    db.session.add(user_article)
                    user_article.keywords.extend([k for k in keywords if k.name in keywords_found])

    db.session.commit()

    current_app.logger.info(f"[SYSTEM] - Finished Adding New Articles to User `{user.username}` Based on Keywords -")
    current_app.logger.info("###############################################################################")


def send_feed_emails():
    current_app.logger.info("###############################################################################")
    current_app.logger.info("[SYSTEM] - Sending Feed Emails -")

    users = (
        db.session.query(User)
        .outerjoin(UserArticle, (User.id == UserArticle.user_id) & (UserArticle.is_archived == False) & (UserArticle.is_read == False))
        .filter(User.active == True, User.send_feed_emails == True)
        .options(contains_eager(User.articles))
        .all()
    )

    for user in users:
        if not user.articles:
            continue

        try:
            send_feed_email(
                to=user.email,
                username=user.username,
                subject="Unread Articles",
                template="unread_articles",
                articles=[article.to_dict() for article in user.articles][:user.max_articles_per_email],
            )
        except:
            current_app.logger.error(f"Failed to send un-read articles email to: {user.email}")

    current_app.logger.info("[SYSTEM] - Finished Sending Feed Emails -")
    current_app.logger.info("###############################################################################")
