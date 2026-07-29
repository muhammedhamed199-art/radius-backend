-- تعديل هيكل قاعدة بيانات FreeRADIUS لإضافة العزل بين الموزعين (Reseller Isolation)

-- 1. جدول radcheck (حسابات المستخدمين وكلمات المرور/السرعة)
CREATE TABLE radcheck (
  id int(11) unsigned NOT NULL auto_increment,
  username varchar(64) NOT NULL default '',
  attribute varchar(64)  NOT NULL default '',
  op char(2) NOT NULL DEFAULT '==',
  value varchar(253) NOT NULL default '',
  reseller_id int(11) unsigned NOT NULL, -- معرف الموزع
  PRIMARY KEY  (id),
  KEY username (username(32)),
  KEY reseller_id (reseller_id)
);

-- 2. جدول radreply (الردود التي يتم إرسالها للراوتر مثل IP، السرعة)
CREATE TABLE radreply (
  id int(11) unsigned NOT NULL auto_increment,
  username varchar(64) NOT NULL default '',
  attribute varchar(64) NOT NULL default '',
  op char(2) NOT NULL DEFAULT '=',
  value varchar(253) NOT NULL default '',
  reseller_id int(11) unsigned NOT NULL, -- معرف الموزع
  PRIMARY KEY  (id),
  KEY username (username(32)),
  KEY reseller_id (reseller_id)
);

-- 3. جدول radacct (سجل الجلسات، الاستهلاك، أوقات الدخول والخروج)
CREATE TABLE radacct (
  radacctid bigint(21) NOT NULL auto_increment,
  acctsessionid varchar(64) NOT NULL default '',
  acctuniqueid varchar(32) NOT NULL default '',
  username varchar(64) NOT NULL default '',
  realm varchar(64) default '',
  nasipaddress varchar(15) NOT NULL default '',
  nasportid varchar(32) default NULL,
  nasporttype varchar(32) default NULL,
  acctstarttime datetime NULL default NULL,
  acctupdatetime datetime NULL default NULL,
  acctstoptime datetime NULL default NULL,
  acctinterval int(12) default NULL,
  acctsessiontime int(12) unsigned default NULL,
  acctauthentic varchar(32) default NULL,
  connectinfo_start varchar(128) default NULL,
  connectinfo_stop varchar(128) default NULL,
  acctinputoctets bigint(20) default NULL,
  acctoutputoctets bigint(20) default NULL,
  calledstationid varchar(50) NOT NULL default '',
  callingstationid varchar(50) NOT NULL default '',
  acctterminatecause varchar(32) default NULL,
  servicetype varchar(32) default NULL,
  framedprotocol varchar(32) default NULL,
  framedipaddress varchar(15) NOT NULL default '',
  reseller_id int(11) unsigned NOT NULL, -- معرف الموزع
  PRIMARY KEY (radacctid),
  UNIQUE KEY acctuniqueid (acctuniqueid),
  KEY username (username(32)),
  KEY framedipaddress (framedipaddress),
  KEY acctsessionid (acctsessionid),
  KEY acctsessiontime (acctsessiontime),
  KEY acctstarttime (acctstarttime),
  KEY acctinterval (acctinterval),
  KEY acctstoptime (acctstoptime),
  KEY nasipaddress (nasipaddress),
  KEY reseller_id (reseller_id)
);

-- 4. جدول nas (أجهزة الميكروتيك أو أجهزة البث المربوطة)
CREATE TABLE nas (
  id int(10) NOT NULL auto_increment,
  nasname varchar(128) NOT NULL,
  shortname varchar(32) default NULL,
  type varchar(30) default 'other',
  ports int(5) default NULL,
  secret varchar(60) NOT NULL DEFAULT 'secret',
  server varchar(64) default NULL,
  community varchar(50) default NULL,
  description varchar(200) default 'RADIUS Client',
  reseller_id int(11) unsigned NOT NULL, -- معرف الموزع
  PRIMARY KEY (id),
  KEY nasname (nasname),
  KEY reseller_id (reseller_id)
);

-- 5. جدول resellers (الموزعين)
CREATE TABLE resellers (
  id int(11) unsigned NOT NULL auto_increment,
  username varchar(64) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  name varchar(128) NOT NULL,
  role varchar(32) DEFAULT 'reseller',
  PRIMARY KEY (id)
);
