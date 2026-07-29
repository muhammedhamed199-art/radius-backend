from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Reseller(Base):
    __tablename__ = "resellers"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True)
    password_hash = Column(String(255))
    name = Column(String(128))
    role = Column(String(32), default='reseller')

class Nas(Base):
    __tablename__ = "nas"
    
    id = Column(Integer, primary_key=True, index=True)
    nasname = Column(String(128), index=True, unique=True) # IP أو دومين الجهاز
    shortname = Column(String(32))
    type = Column(String(30), default='mikrotik')
    ports = Column(Integer)
    secret = Column(String(60), default='secret') # Radius Secret
    server = Column(String(64))
    community = Column(String(50))
    description = Column(String(200))
    reseller_id = Column(Integer, ForeignKey("resellers.id")) # ربط الجهاز بالموزع

class RadCheck(Base):
    __tablename__ = "radcheck"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), index=True)
    attribute = Column(String(64), default='Cleartext-Password')
    op = Column(String(2), default='==')
    value = Column(String(253))
    reseller_id = Column(Integer, ForeignKey("resellers.id"))

class RadReply(Base):
    __tablename__ = "radreply"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), index=True)
    attribute = Column(String(64))
    op = Column(String(2), default='=')
    value = Column(String(253))
    reseller_id = Column(Integer, ForeignKey("resellers.id"))

class RadAcct(Base):
    __tablename__ = "radacct"
    
    radacctid = Column(Integer, primary_key=True, index=True)
    acctsessionid = Column(String(64), index=True)
    acctuniqueid = Column(String(32), unique=True)
    username = Column(String(64), index=True)
    realm = Column(String(64))
    nasipaddress = Column(String(15), index=True)
    nasportid = Column(String(32))
    nasporttype = Column(String(32))
    acctstarttime = Column(String(32))
    acctupdatetime = Column(String(32))
    acctstoptime = Column(String(32))
    acctinterval = Column(Integer)
    acctsessiontime = Column(Integer, index=True)
    acctauthentic = Column(String(32))
    connectinfo_start = Column(String(128))
    connectinfo_stop = Column(String(128))
    acctinputoctets = Column(Integer)
    acctoutputoctets = Column(Integer)
    calledstationid = Column(String(50))
    callingstationid = Column(String(50))
    acctterminatecause = Column(String(32))
    servicetype = Column(String(32))
    framedprotocol = Column(String(32))
    framedipaddress = Column(String(15), index=True)
    reseller_id = Column(Integer, ForeignKey("resellers.id"))
