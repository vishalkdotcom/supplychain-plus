-- DROP SCHEMA dbo;
GO

-- CREATE SCHEMA dbo (already exists)
-- WOVO.dbo.AttachmentType definition

-- Drop table

-- DROP TABLE WOVO.dbo.AttachmentType;
GO

CREATE TABLE WOVO.dbo.AttachmentType (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.AttachmentType] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.AuditLog definition

-- Drop table

-- DROP TABLE WOVO.dbo.AuditLog;
GO

CREATE TABLE WOVO.dbo.AuditLog (
	Id int IDENTITY(1,1) NOT NULL,
	UserId int NULL,
	UserFullName nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UserEmail nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EntityId int NULL,
	Message nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EventDate datetime NOT NULL,
	[Path] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	QueryString nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	IPAddress nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UserAgent nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EventType int NOT NULL,
	EventFlags nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.AuditLog] PRIMARY KEY (Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.AuditLog (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CaseStatus definition

-- Drop table

-- DROP TABLE WOVO.dbo.CaseStatus;
GO

CREATE TABLE WOVO.dbo.CaseStatus (
	Id int IDENTITY(1,1) NOT NULL,
	isActive bit NOT NULL,
	CONSTRAINT [PK_dbo.CaseStatus] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.CaseType definition

-- Drop table

-- DROP TABLE WOVO.dbo.CaseType;
GO

CREATE TABLE WOVO.dbo.CaseType (
	Id int IDENTITY(1,1) NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	isGlobal bit NOT NULL,
	CONSTRAINT [PK_dbo.CaseType] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.CommunicationChannel definition

-- Drop table

-- DROP TABLE WOVO.dbo.CommunicationChannel;
GO

CREATE TABLE WOVO.dbo.CommunicationChannel (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.CommunicationChannel] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.CompanyPostResponse definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyPostResponse;
GO

CREATE TABLE WOVO.dbo.CompanyPostResponse (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyPostId int NOT NULL,
	UserId int NULL,
	Status bit NULL,
	ShortURL nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ParticipantIdentifier nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CustFieldDepartmentId int NULL,
	CustFieldDepartmentName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Guid uniqueidentifier NOT NULL,
	CommunicationChannelId int NULL,
	IsPostSent bit NOT NULL,
	IsNotificationSent bit NOT NULL,
	Created datetime NULL,
	Modified datetime NULL
);
GO
 CREATE NONCLUSTERED INDEX IX_CommunicationChannelIdNew ON WOVO.dbo.CompanyPostResponse (  CommunicationChannelId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CompanyPostIdNew ON WOVO.dbo.CompanyPostResponse (  CompanyPostId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserIdNew ON WOVO.dbo.CompanyPostResponse (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_participantIdentifierNew ON WOVO.dbo.CompanyPostResponse (  ParticipantIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX nci_wi_CompanyPostResponseNew ON WOVO.dbo.CompanyPostResponse (  UserId ASC  , Status ASC  )
	 INCLUDE ( CompanyPostId )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX nci_wi_CompanyPostResponseNewTable ON WOVO.dbo.CompanyPostResponse (  CompanyPostId ASC  , UserId ASC  )
	 INCLUDE ( CommunicationChannelId , Created , CustFieldDepartmentId , CustFieldDepartmentName , Guid , IsNotificationSent , IsPostSent , Modified , ParticipantIdentifier , ShortURL , Status )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ConnectAttachment definition

-- Drop table

-- DROP TABLE WOVO.dbo.ConnectAttachment;
GO

CREATE TABLE WOVO.dbo.ConnectAttachment (
	Id int IDENTITY(1,1) NOT NULL,
	FileName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PhysicalPath nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.ConnectAttachment] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.ConsoldtStgPrvNum definition

-- Drop table

-- DROP TABLE WOVO.dbo.ConsoldtStgPrvNum;
GO

CREATE TABLE WOVO.dbo.ConsoldtStgPrvNum (
	CountryId float NULL,
	Country nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UCMSID float NULL,
	AssignedSMSline nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Provider nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	APIUname nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	APIPasswd nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ProviderId float NULL
);
GO


-- WOVO.dbo.Country definition

-- Drop table

-- DROP TABLE WOVO.dbo.Country;
GO

CREATE TABLE WOVO.dbo.Country (
	Id int IDENTITY(1,1) NOT NULL,
	Abbr nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Abbr2 nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CountryCode int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.Country] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.CultureCode definition

-- Drop table

-- DROP TABLE WOVO.dbo.CultureCode;
GO

CREATE TABLE WOVO.dbo.CultureCode (
	Id int IDENTITY(1,1) NOT NULL,
	[Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	ResourceVersion real NOT NULL,
	AppSupported bit NOT NULL,
	CONSTRAINT [PK_dbo.CultureCode] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.CustomField definition

-- Drop table

-- DROP TABLE WOVO.dbo.CustomField;
GO

CREATE TABLE WOVO.dbo.CustomField (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RelatesTo int NULL,
	IsRequired bit NULL,
	CompanyId int NULL,
	IsCheckedByDefault bit NULL,
	Discriminator nvarchar(128) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	IsReadOnly bit NOT NULL,
	IsDeleted bit NOT NULL,
	IsArchived bit NOT NULL,
	UseColorHighlighting bit NOT NULL,
	HighlightColor nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OrderNumber int NOT NULL,
	IsDefault bit NOT NULL,
	AreaId int NULL,
	TabId int NULL,
	CustomFieldType int NOT NULL,
	ProviderId int NULL,
	SourceID int NULL,
	SourceName nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CreatedById int NULL,
	CreatedDate datetime NULL,
	ModifiedById int NULL,
	ModifiedDate datetime NULL,
	DataLoadDate datetime NULL
);
GO


-- WOVO.dbo.CustomFieldArea definition

-- Drop table

-- DROP TABLE WOVO.dbo.CustomFieldArea;
GO

CREATE TABLE WOVO.dbo.CustomFieldArea (
	Id int NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RelatesTo int NULL,
	CustomFieldType int NOT NULL
);
GO


-- WOVO.dbo.CustomFieldDropDownListItem definition

-- Drop table

-- DROP TABLE WOVO.dbo.CustomFieldDropDownListItem;
GO

CREATE TABLE WOVO.dbo.CustomFieldDropDownListItem (
	Id int IDENTITY(1,1) NOT NULL,
	DropDownListId int NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	IsDeleted bit NOT NULL,
	Source_DropDownListType nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DataLoadDate datetime NULL
);
GO


-- WOVO.dbo.CustomFieldRadioButtonItem definition

-- Drop table

-- DROP TABLE WOVO.dbo.CustomFieldRadioButtonItem;
GO

CREATE TABLE WOVO.dbo.CustomFieldRadioButtonItem (
	Id int NOT NULL,
	RadioButtonId int NOT NULL,
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	IsDeleted bit NOT NULL
);
GO


-- WOVO.dbo.CustomFieldValue definition

-- Drop table

-- DROP TABLE WOVO.dbo.CustomFieldValue;
GO

CREATE TABLE WOVO.dbo.CustomFieldValue (
	Id int NOT NULL,
	CompanyId int NULL,
	ParticipantId int NULL,
	CaseId int NULL,
	CustomFieldId int NULL,
	Value nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DropDownListItemId int NULL,
	Discriminator nvarchar(128) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	IsArchived bit NOT NULL,
	RadioButtonListItemId int NULL,
	ProviderId int NULL,
	CreatedById int NULL,
	CreatedDate datetime NULL,
	ModifiedById int NULL,
	ModifiedDate datetime NULL,
	SourceID int NULL,
	SourceName nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SourceIDRef_OrgID int NULL,
	SourceID_ClientID int NULL,
	DataLoadDate datetime NULL
);
GO
 CREATE NONCLUSTERED INDEX IX_ParticipantId ON WOVO.dbo.CustomFieldValue (  ParticipantId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX nci_wi_CustomFieldValue_B2F8A94EB7CD1F44D8F0A58D4099CD23 ON WOVO.dbo.CustomFieldValue (  CompanyId ASC  )
	 INCLUDE ( CustomFieldId , DropDownListItemId , ParticipantId , RadioButtonListItemId )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.DataLog definition

-- Drop table

-- DROP TABLE WOVO.dbo.DataLog;
GO

CREATE TABLE WOVO.dbo.DataLog (
	Id int IDENTITY(1,1) NOT NULL,
	EventDate datetime NULL,
	[Action] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Data] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.DataLog] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.DemographicFilter definition

-- Drop table

-- DROP TABLE WOVO.dbo.DemographicFilter;
GO

CREATE TABLE WOVO.dbo.DemographicFilter (
	Id int IDENTITY(1,1) NOT NULL,
	ResourceId int NOT NULL,
	ResourceKey int NOT NULL,
	CultureCodeId int NOT NULL,
	value nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.DemographicFilter] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.Gender definition

-- Drop table

-- DROP TABLE WOVO.dbo.Gender;
GO

CREATE TABLE WOVO.dbo.Gender (
	Id int IDENTITY(1,1) NOT NULL,
	IsDeleted bit NOT NULL,
	CONSTRAINT [PK_dbo.Gender] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.IPSheet definition

-- Drop table

-- DROP TABLE WOVO.dbo.IPSheet;
GO

CREATE TABLE WOVO.dbo.IPSheet (
	CompanyId nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	StartIPAddress nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EndIPAddress nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted float NULL
);
GO


-- WOVO.dbo.Location definition

-- Drop table

-- DROP TABLE WOVO.dbo.Location;
GO

CREATE TABLE WOVO.dbo.Location (
	Id int IDENTITY(1,1) NOT NULL,
	Abbr nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	LocationCode int NOT NULL,
	CONSTRAINT [PK_dbo.Location] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.Log definition

-- Drop table

-- DROP TABLE WOVO.dbo.Log;
GO

CREATE TABLE WOVO.dbo.Log (
	Id int IDENTITY(1,1) NOT NULL,
	[Date] datetime NOT NULL,
	Thread nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Level] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Logger nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Message nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Exception] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.Log] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.MessageCategory definition

-- Drop table

-- DROP TABLE WOVO.dbo.MessageCategory;
GO

CREATE TABLE WOVO.dbo.MessageCategory (
	Id int IDENTITY(1,1) NOT NULL,
	AllowToDashboard bit NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	OrderNum int NOT NULL,
	CONSTRAINT [PK_dbo.MessageCategory] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.MessageType definition

-- Drop table

-- DROP TABLE WOVO.dbo.MessageType;
GO

CREATE TABLE WOVO.dbo.MessageType (
	Id int IDENTITY(1,1) NOT NULL,
	isActive bit NOT NULL,
	CONSTRAINT [PK_dbo.MessageType] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.Participant definition

-- Drop table

-- DROP TABLE WOVO.dbo.Participant;
GO

CREATE TABLE WOVO.dbo.Participant (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NULL,
	CountryId int NULL,
	GenderId int NULL,
	LocationId int NULL,
	CreatedById int NULL,
	ModifiedById int NULL,
	FirstName nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LastName nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FullName nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CleanFullName nvarchar(450) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MiddleName nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Email nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SecondaryEmail nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	WorkEmail nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SSN nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Spouse nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CompanyEmployeeIDNum nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	IsActive bit NOT NULL,
	DOB datetime NULL,
	CreatedDate datetime NULL,
	Identifier nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	IsTransfer bit NOT NULL,
	TransferDate datetime NULL,
	IsDeleted bit NOT NULL,
	DeletedDate datetime NULL,
	WorkerLastDate datetime NULL,
	ModifiedDate datetime NOT NULL,
	isSmartPhone int NULL,
	WorkerStartDate datetime NULL,
	JobRole int NOT NULL,
	CONSTRAINT [PK_dbo.ParticipantNEW] PRIMARY KEY (Id)
);
GO
 CREATE NONCLUSTERED INDEX IDX_CleanFullName ON WOVO.dbo.Participant (  CleanFullName ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IDX_Email ON WOVO.dbo.Participant (  Email ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IDX_FirstName ON WOVO.dbo.Participant (  FirstName ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IDX_FullName ON WOVO.dbo.Participant (  FullName ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IDX_LastName ON WOVO.dbo.Participant (  LastName ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IDX_MiddleName ON WOVO.dbo.Participant (  MiddleName ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX nci_wi_Participant_8E34370058C417E9B4ACC25C5CC844AFF ON WOVO.dbo.Participant (  CompanyId ASC  , WorkerLastDate ASC  )
	 INCLUDE ( CleanFullName , CompanyEmployeeIDNum , CountryId , CreatedById , CreatedDate , DeletedDate , DOB , Email , FirstName , FullName , GenderId , Identifier , IsActive , IsDeleted , isSmartPhone , IsTransfer , LastName , LocationId , MiddleName , ModifiedById , ModifiedDate , SecondaryEmail , Spouse , SSN , TransferDate , WorkEmail , WorkerStartDate )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PaySlipResponse definition

-- Drop table

-- DROP TABLE WOVO.dbo.PaySlipResponse;
GO

CREATE TABLE WOVO.dbo.PaySlipResponse (
	Id int IDENTITY(1,1) NOT NULL,
	PaySlipId int NOT NULL,
	UserId int NULL,
	Status bit NULL,
	ShortURL nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ParticipantIdentifier nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CustFieldDepartmentId int NULL,
	CustFieldDepartmentName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Guid uniqueidentifier NOT NULL,
	CommunicationChannelId int NULL,
	IsPaySlipSent bit NOT NULL,
	IsNotificationSent bit NOT NULL,
	CONSTRAINT [PK_dbo.PaySlipResponse] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.PayslipMemoryStream definition

-- Drop table

-- DROP TABLE WOVO.dbo.PayslipMemoryStream;
GO

CREATE TABLE WOVO.dbo.PayslipMemoryStream (
	Id int IDENTITY(1,1) NOT NULL,
	PayslipId int NOT NULL,
	CompanyEmployeeIDNum nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Name nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	MemoryStream varbinary(MAX) NOT NULL,
	HtmlPaySlip nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	JsonData nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_PayslipMemoryStream_1 PRIMARY KEY (Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_PayslipMemoryStream_Keys ON WOVO.dbo.PayslipMemoryStream (  CompanyEmployeeIDNum ASC  , PayslipId ASC  )
	 INCLUDE ( JsonData )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PayslipMemoryStream_Lookup ON WOVO.dbo.PayslipMemoryStream (  CompanyEmployeeIDNum ASC  , PayslipId ASC  )
	 INCLUDE ( JsonData )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PostStatus definition

-- Drop table

-- DROP TABLE WOVO.dbo.PostStatus;
GO

CREATE TABLE WOVO.dbo.PostStatus (
	Id int IDENTITY(1,1) NOT NULL,
	isActive bit NOT NULL,
	CONSTRAINT [PK_dbo.PostStatus] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.PostType definition

-- Drop table

-- DROP TABLE WOVO.dbo.PostType;
GO

CREATE TABLE WOVO.dbo.PostType (
	Id int IDENTITY(1,1) NOT NULL,
	isActive bit NOT NULL,
	CONSTRAINT [PK_dbo.PostType] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.RaspberryPIOutbox definition

-- Drop table

-- DROP TABLE WOVO.dbo.RaspberryPIOutbox;
GO

CREATE TABLE WOVO.dbo.RaspberryPIOutbox (
	Id int IDENTITY(1,1) NOT NULL,
	[From] nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[To] nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Content nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Status int NOT NULL,
	Created datetime NOT NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.RaspberryPIOutbox] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.ResourceKey definition

-- Drop table

-- DROP TABLE WOVO.dbo.ResourceKey;
GO

CREATE TABLE WOVO.dbo.ResourceKey (
	Id int IDENTITY(1,1) NOT NULL,
	[Key] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AppSupported bit NOT NULL,
	CONSTRAINT [PK_dbo.ResourceKey] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.ResponseType definition

-- Drop table

-- DROP TABLE WOVO.dbo.ResponseType;
GO

CREATE TABLE WOVO.dbo.ResponseType (
	Id int IDENTITY(1,1) NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	Email bit NOT NULL,
	CONSTRAINT [PK_dbo.ResponseType] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.SMSProvider definition

-- Drop table

-- DROP TABLE WOVO.dbo.SMSProvider;
GO

CREATE TABLE WOVO.dbo.SMSProvider (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	APIFragment nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	APIURL nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	APIKey nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	APIUName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	APIPasword nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.SMSProvider] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.Sprint17Trans definition

-- Drop table

-- DROP TABLE WOVO.dbo.Sprint17Trans;
GO

CREATE TABLE WOVO.dbo.Sprint17Trans (
	ResourceID float NULL,
	CultureCodeID float NULL,
	Value nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
);
GO


-- WOVO.dbo.Tag definition

-- Drop table

-- DROP TABLE WOVO.dbo.Tag;
GO

CREATE TABLE WOVO.dbo.Tag (
	Id int IDENTITY(1,1) NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.Tag] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.TransferAudit definition

-- Drop table

-- DROP TABLE WOVO.dbo.TransferAudit;
GO

CREATE TABLE WOVO.dbo.TransferAudit (
	Id int IDENTITY(1,1) NOT NULL,
	OldIdentifier nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	NewIdentifier nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	TransferedDate datetime NULL,
	CONSTRAINT [PK_dbo.TransferAudit] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.[__MigrationHistory] definition

-- Drop table

-- DROP TABLE WOVO.dbo.[__MigrationHistory];
GO

CREATE TABLE WOVO.dbo.[__MigrationHistory] (
	MigrationId nvarchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ContextKey nvarchar(300) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Model varbinary(MAX) NOT NULL,
	ProductVersion nvarchar(32) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT [PK_dbo.__MigrationHistory] PRIMARY KEY (MigrationId,ContextKey)
);
GO


-- WOVO.dbo.stgBA_Dinhan_Data definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgBA_Dinhan_Data;
GO

CREATE TABLE WOVO.dbo.stgBA_Dinhan_Data (
	[Phone Number] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[First Name] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Last Name] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DateOfBirth datetime NULL,
	Gender nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Employee Id] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Postal Code] float NULL,
	Status nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Department nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
);
GO


-- WOVO.dbo.stgPayslipRawdata definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgPayslipRawdata;
GO

CREATE TABLE WOVO.dbo.stgPayslipRawdata (
	Title nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Employee ID] float NULL,
	[Phone Number] float NULL,
	[Employee Name] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Employee Division] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Employee Position] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Basic Hourly Rate] float NULL,
	[Number of Basic Working Hours] float NULL,
	[Basic Monthly Wage] float NULL,
	[Overtime Hourly Rate] float NULL,
	[Overtime Hours] float NULL,
	[Monthly Overtime Wage] float NULL,
	Bonus float NULL,
	[Gross Wage] float NULL,
	Deduction float NULL,
	[Net Wage] float NULL
);
GO


-- WOVO.dbo.stgPayslipReportData definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgPayslipReportData;
GO

CREATE TABLE WOVO.dbo.stgPayslipReportData (
	PayslipId int NULL,
	CompanyAttachmentId int NULL,
	CompanyId int NULL,
	CustFieldDepartmentId int NULL,
	CustFieldDepartmentName nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	HeaderText nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Value nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
);
GO


-- WOVO.dbo.stgTimeZoneRawData definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgTimeZoneRawData;
GO

CREATE TABLE WOVO.dbo.stgTimeZoneRawData (
	CompanyCode float NULL,
	CompanyName nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Timezone nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DateTimeZone nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
);
GO


-- WOVO.dbo.stgVAddressType definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVAddressType;
GO

CREATE TABLE WOVO.dbo.stgVAddressType (
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVAutoResponse definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVAutoResponse;
GO

CREATE TABLE WOVO.dbo.stgVAutoResponse (
	ResponseTypeId float NULL,
	AutoResponseId float NULL,
	[Response (English)] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Title (English)] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Response (Translated Text)] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Title (Translated Text)] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVCaseStatus definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVCaseStatus;
GO

CREATE TABLE WOVO.dbo.stgVCaseStatus (
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVCountry definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVCountry;
GO

CREATE TABLE WOVO.dbo.stgVCountry (
	Abbr2 nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Countries (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Countries (Translated text)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL,
	CountryId int NULL
);
GO


-- WOVO.dbo.stgVGender definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVGender;
GO

CREATE TABLE WOVO.dbo.stgVGender (
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVKeywords_Emergency definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVKeywords_Emergency;
GO

CREATE TABLE WOVO.dbo.stgVKeywords_Emergency (
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVLanguage definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVLanguage;
GO

CREATE TABLE WOVO.dbo.stgVLanguage (
	[Key] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Languages (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Languages (Translated Text)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL,
	CorrectKey nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL
);
GO


-- WOVO.dbo.stgVMessageCategory definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVMessageCategory;
GO

CREATE TABLE WOVO.dbo.stgVMessageCategory (
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVMessageType definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVMessageType;
GO

CREATE TABLE WOVO.dbo.stgVMessageType (
	[Table] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translation Text (English)1] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text (for Column C)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text (for Column D)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVModules definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVModules;
GO

CREATE TABLE WOVO.dbo.stgVModules (
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVPhoneType definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVPhoneType;
GO

CREATE TABLE WOVO.dbo.stgVPhoneType (
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVPostStatus definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVPostStatus;
GO

CREATE TABLE WOVO.dbo.stgVPostStatus (
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVPostType definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVPostType;
GO

CREATE TABLE WOVO.dbo.stgVPostType (
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVReportType definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVReportType;
GO

CREATE TABLE WOVO.dbo.stgVReportType (
	[Key] float NULL,
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVResourceKey definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVResourceKey;
GO

CREATE TABLE WOVO.dbo.stgVResourceKey (
	[Key] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translation Text (English)] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AppSupported float NULL,
	[Translated Text] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVResponseType definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVResponseType;
GO

CREATE TABLE WOVO.dbo.stgVResponseType (
	ResponseTypeId float NULL,
	[Translation Text (English)] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stgVSpamText definition

-- Drop table

-- DROP TABLE WOVO.dbo.stgVSpamText;
GO

CREATE TABLE WOVO.dbo.stgVSpamText (
	[Translation Text (English)] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translated Text] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCode float NULL
);
GO


-- WOVO.dbo.stg_Resources definition

-- Drop table

-- DROP TABLE WOVO.dbo.stg_Resources;
GO

CREATE TABLE WOVO.dbo.stg_Resources (
	[Key] nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Translation Text (English)] nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AppSupported float NULL,
	CultureCodeId float NULL
);
GO


-- WOVO.dbo.systranschemas definition

-- Drop table

-- DROP TABLE WOVO.dbo.systranschemas;
GO

CREATE TABLE WOVO.dbo.systranschemas (
	tabid int NOT NULL,
	startlsn binary(10) NOT NULL,
	endlsn binary(10) NOT NULL,
	typeid int NOT NULL
);
GO
 CREATE UNIQUE CLUSTERED INDEX uncsystranschemas ON WOVO.dbo.systranschemas (  startlsn ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.tblAvatar definition

-- Drop table

-- DROP TABLE WOVO.dbo.tblAvatar;
GO

CREATE TABLE WOVO.dbo.tblAvatar (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	AzureUrl nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NOT NULL,
	CONSTRAINT [PK_dbo.tblAvatar] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.tblCaseAttachment definition

-- Drop table

-- DROP TABLE WOVO.dbo.tblCaseAttachment;
GO

CREATE TABLE WOVO.dbo.tblCaseAttachment (
	ID int IDENTITY(1,1) NOT NULL,
	CaseId int NULL,
	FileName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FileType nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FilePath nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	isDeleted bit NULL,
	CONSTRAINT PK_tblCaseAttachment PRIMARY KEY (ID)
);
GO


-- WOVO.dbo.tblSecretQuestions definition

-- Drop table

-- DROP TABLE WOVO.dbo.tblSecretQuestions;
GO

CREATE TABLE WOVO.dbo.tblSecretQuestions (
	Id int IDENTITY(1,1) NOT NULL,
	QuestionText nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CultureCodeId int NOT NULL,
	[Key] nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NOT NULL,
	AzureUrl nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.tblSecretQuestions] PRIMARY KEY (Id)
);
GO


-- WOVO.dbo.tblUserActivityHistrory definition

-- Drop table

-- DROP TABLE WOVO.dbo.tblUserActivityHistrory;
GO

CREATE TABLE WOVO.dbo.tblUserActivityHistrory (
	StatusId int IDENTITY(1,1) NOT NULL,
	UserID int NOT NULL,
	Home int NOT NULL,
	HomeLatestDate datetime NOT NULL,
	MyCompany int NOT NULL,
	MyCompanyLatestDate datetime NOT NULL,
	[Connect] int NOT NULL,
	ConnectLatestDate datetime NOT NULL,
	NewsLetter int NOT NULL,
	NewsLetterLatestDate datetime NOT NULL,
	PaySlip int NOT NULL,
	PaySlipLatestDate datetime NOT NULL,
	Survey int NOT NULL,
	SurveyLatestDate datetime NOT NULL,
	FAQ int NOT NULL,
	FAQLatestDate datetime NOT NULL,
	Document int NOT NULL,
	DocumentLatestDate datetime NOT NULL,
	Calender int NOT NULL,
	CalenderLatestDate datetime NOT NULL,
	Learn int NOT NULL,
	LearnLatestDate datetime NOT NULL,
	BroadCast int NOT NULL,
	BroadCastLatestDate datetime NOT NULL
);
GO


-- WOVO.dbo.tblUserStatusHistrory definition

-- Drop table

-- DROP TABLE WOVO.dbo.tblUserStatusHistrory;
GO

CREATE TABLE WOVO.dbo.tblUserStatusHistrory (
	StatusId int IDENTITY(1,1) NOT NULL,
	UserID int NOT NULL,
	UserName nchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CompanyEmployeeIDNum nchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LastCompanyId int NULL,
	DeActivedDate datetime NULL,
	ActivedDate datetime NULL
);
GO


-- WOVO.dbo.temp_PayslipMemoryStream definition

-- Drop table

-- DROP TABLE WOVO.dbo.temp_PayslipMemoryStream;
GO

CREATE TABLE WOVO.dbo.temp_PayslipMemoryStream (
	Id int IDENTITY(1,1) NOT NULL,
	PayslipId int NOT NULL,
	CompanyEmployeeIDNum nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Name nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	MemoryStream varbinary(MAX) NOT NULL,
	HtmlPaySlip nvarchar(4000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
);
GO


-- WOVO.dbo.Address definition

-- Drop table

-- DROP TABLE WOVO.dbo.Address;
GO

CREATE TABLE WOVO.dbo.Address (
	Id int IDENTITY(1,1) NOT NULL,
	TypeId int NULL,
	ParticipantId int NULL,
	CountryId int NULL,
	StateId int NULL,
	City nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Street nvarchar(300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Street2 nvarchar(300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Street3 nvarchar(300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ZipCode nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RegionName nvarchar(300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Latitude float NULL,
	Longitude float NULL,
	ZipLatitude float NULL,
	ZipLongitude float NULL,
	CreatedDate datetime NULL,
	CONSTRAINT [PK_dbo.Address] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Address_dbo.Participant_ParticipantId] FOREIGN KEY (ParticipantId) REFERENCES WOVO.dbo.Participant(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_ParticipantId ON WOVO.dbo.Address (  ParticipantId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.AuditLogObjectChange definition

-- Drop table

-- DROP TABLE WOVO.dbo.AuditLogObjectChange;
GO

CREATE TABLE WOVO.dbo.AuditLogObjectChange (
	Id int IDENTITY(1,1) NOT NULL,
	TypeName nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ObjectReference nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AuditLogId int NULL,
	ChangeType int NOT NULL,
	IsPermanentDeleted bit NOT NULL,
	CONSTRAINT [PK_dbo.AuditLogObjectChange] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.AuditLogObjectChange_dbo.AuditLog_AuditLogId] FOREIGN KEY (AuditLogId) REFERENCES WOVO.dbo.AuditLog(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_AuditLogId ON WOVO.dbo.AuditLogObjectChange (  AuditLogId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.AuditLogPropertyChange definition

-- Drop table

-- DROP TABLE WOVO.dbo.AuditLogPropertyChange;
GO

CREATE TABLE WOVO.dbo.AuditLogPropertyChange (
	Id int IDENTITY(1,1) NOT NULL,
	ObjectChangeId int NULL,
	PropertyName nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	OriginalValue nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NewValue nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ValueAsInt int NULL,
	CONSTRAINT [PK_dbo.AuditLogPropertyChange] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.AuditLogPropertyChange_dbo.AuditLogObjectChange_ObjectChangeId] FOREIGN KEY (ObjectChangeId) REFERENCES WOVO.dbo.AuditLogObjectChange(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_ObjectChangeId ON WOVO.dbo.AuditLogPropertyChange (  ObjectChangeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CaseStatusCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.CaseStatusCultureText;
GO

CREATE TABLE WOVO.dbo.CaseStatusCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CaseStatusId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.CaseStatusCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CaseStatusCultureText_dbo.CaseStatus_CaseStatusId] FOREIGN KEY (CaseStatusId) REFERENCES WOVO.dbo.CaseStatus(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CaseStatusCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CaseStatusId ON WOVO.dbo.CaseStatusCultureText (  CaseStatusId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.CaseStatusCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CaseTypeCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.CaseTypeCultureText;
GO

CREATE TABLE WOVO.dbo.CaseTypeCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CaseTypeId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.CaseTypeCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CaseTypeCultureText_dbo.CaseType_CaseTypeId] FOREIGN KEY (CaseTypeId) REFERENCES WOVO.dbo.CaseType(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CaseTypeCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CaseTypeId ON WOVO.dbo.CaseTypeCultureText (  CaseTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.CaseTypeCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.Company definition

-- Drop table

-- DROP TABLE WOVO.dbo.Company;
GO

CREATE TABLE WOVO.dbo.Company (
	Name nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EAPCompanyId int NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	EAPTypeId int NULL,
	ParentCompanyId int NULL,
	SyncDate datetime NULL,
	CleanName nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MailingCountry nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Id int IDENTITY(1,1) NOT NULL,
	AccountManager nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MailingCountryId int NULL,
	EmergencyPhone nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LogoSrc nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DeletedDate datetime NULL,
	CONSTRAINT [PK_dbo.CompanyN] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Company_dbo.Company_EAPCompanyId] FOREIGN KEY (EAPCompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.Company_dbo.Company_EAPCompanyIdNew] FOREIGN KEY (EAPCompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.Company_dbo.Company_ParentCompanyId] FOREIGN KEY (ParentCompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.Company_dbo.Company_ParentCompanyIdNew] FOREIGN KEY (ParentCompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyNEW_Id ON WOVO.dbo.Company (  Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_EAPCompanyId ON WOVO.dbo.Company (  EAPCompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ParentCompanyId ON WOVO.dbo.Company (  ParentCompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyAttachment definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyAttachment;
GO

CREATE TABLE WOVO.dbo.CompanyAttachment (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	AttachmentTypeId int NOT NULL,
	FileName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AppShare bit NOT NULL,
	WebShare bit NOT NULL,
	CreationDate datetime NOT NULL,
	PhysicalPath nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	Status int NULL,
	Reason nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Title nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AzureUrl nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.CompanyAttachment] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyAttachment_dbo.AttachmentType_AttachmentTypeId] FOREIGN KEY (AttachmentTypeId) REFERENCES WOVO.dbo.AttachmentType(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyAttachment_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_AttachmentTypeId ON WOVO.dbo.CompanyAttachment (  AttachmentTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyAttachment (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyBroadcast definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyBroadcast;
GO

CREATE TABLE WOVO.dbo.CompanyBroadcast (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	Alloted int NOT NULL,
	Used int NOT NULL,
	StartDate datetime NOT NULL,
	EndDate datetime NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.CompanyBroadcast] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyBroadcast_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyBroadcast (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyCaseType definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyCaseType;
GO

CREATE TABLE WOVO.dbo.CompanyCaseType (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	CaseTypeId int NOT NULL,
	isInherited bit NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.CompanyCaseType] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyCaseType_dbo.CaseType_CaseTypeId] FOREIGN KEY (CaseTypeId) REFERENCES WOVO.dbo.CaseType(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyCaseType_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CaseTypeId ON WOVO.dbo.CompanyCaseType (  CaseTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyCaseType (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyCommunicationChannel definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyCommunicationChannel;
GO

CREATE TABLE WOVO.dbo.CompanyCommunicationChannel (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	CommunicationChanelId int NOT NULL,
	isInherited bit NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.CompanyCommunicationChannel] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyCommunicationChanel_dbo.CommunicationChanel_CommunicationChanelId] FOREIGN KEY (CommunicationChanelId) REFERENCES WOVO.dbo.CommunicationChannel(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyCommunicationChannel_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CommunicationChanelId ON WOVO.dbo.CompanyCommunicationChannel (  CommunicationChanelId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyCommunicationChannel (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyEvent definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyEvent;
GO

CREATE TABLE WOVO.dbo.CompanyEvent (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	EventDateTime datetime NOT NULL,
	Duration int NOT NULL,
	TimeZone nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Location nvarchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	IsFeatured bit NOT NULL,
	ThumbnailImageUrl nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Message nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EndDate datetime NULL,
	FeaturedSartDate datetime NULL,
	AttachmentUrl nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.CompanyEvent] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyEvent_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyEvent (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyEventCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyEventCultureText;
GO

CREATE TABLE WOVO.dbo.CompanyEventCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	CultureCodeId int NOT NULL,
	CompanyEventId int NOT NULL,
	EventTitle nvarchar(64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EventContent nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AttachmentId int NULL,
	CONSTRAINT [PK_dbo.CompanyEventCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyEventCultureText_dbo.CompanyEvent_CompanyEventId] FOREIGN KEY (CompanyEventId) REFERENCES WOVO.dbo.CompanyEvent(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyEventCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyEventId ON WOVO.dbo.CompanyEventCultureText (  CompanyEventId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.CompanyEventCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyEventRSVP definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyEventRSVP;
GO

CREATE TABLE WOVO.dbo.CompanyEventRSVP (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyEventId int NOT NULL,
	UserId int NOT NULL,
	RSVP int NOT NULL,
	RSVPReminder int NULL,
	IsReminded bit NOT NULL,
	Status bit NOT NULL,
	CONSTRAINT [PK_dbo.CompanyEventRSVP] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyEventRSVP_dbo.CompanyEvent_CompanyEventId] FOREIGN KEY (CompanyEventId) REFERENCES WOVO.dbo.CompanyEvent(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyEventId ON WOVO.dbo.CompanyEventRSVP (  CompanyEventId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.CompanyEventRSVP (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyHierarchy definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyHierarchy;
GO

CREATE TABLE WOVO.dbo.CompanyHierarchy (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	[Type] int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	Module int NOT NULL,
	CONSTRAINT [PK_dbo.CompanyHierarchy] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyHierarchy_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyHierarchy (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyIPRestriction definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyIPRestriction;
GO

CREATE TABLE WOVO.dbo.CompanyIPRestriction (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	StartIPAddress nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EndIPAddress nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.CompanyIPRestriction] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyIPRestriction_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyIPRestriction (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyServiceHour definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyServiceHour;
GO

CREATE TABLE WOVO.dbo.CompanyServiceHour (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	DayofWeek int NOT NULL,
	DateTimeZone nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	StartTime nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EndTime nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.CompanyServiceHour] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyServiceHour_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyServiceHour (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanySetting definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanySetting;
GO

CREATE TABLE WOVO.dbo.CompanySetting (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	DefaultCaseResolutionHours int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	Code nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	showMessagesForUnregistered bit NOT NULL,
	factoryToken nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	appId nvarchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	secret nvarchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SendIntroMsgsToNewContacts bit NOT NULL,
	AndroidNotificationPlatform int NOT NULL,
	CultureCodeId int NULL,
	AllowOTP bit NOT NULL,
	AllowContact bit NOT NULL,
	DashboardOTP bit NOT NULL,
	AllowIPAddress bit NOT NULL,
	AllowUnRegisterUser_APP bit NOT NULL,
	AllowUnRegisterUser_SMS bit NOT NULL,
	CONSTRAINT [PK_dbo.CompanySetting] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanySetting_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.CompanySetting_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id)
);
GO
 CREATE UNIQUE NONCLUSTERED INDEX CodeIndex ON WOVO.dbo.CompanySetting (  Code ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanySetting (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.CompanySetting (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ContactGroup definition

-- Drop table

-- DROP TABLE WOVO.dbo.ContactGroup;
GO

CREATE TABLE WOVO.dbo.ContactGroup (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NULL,
	isActive bit NOT NULL,
	IsSystem bit NOT NULL,
	CONSTRAINT [PK_dbo.ContactGroup] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.ContactGroup_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.ContactGroup (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ContactGroupCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.ContactGroupCultureText;
GO

CREATE TABLE WOVO.dbo.ContactGroupCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ContactGroupId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.ContactGroupCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.ContactGroupCultureText_dbo.ContactGroup_ContactGroupId] FOREIGN KEY (ContactGroupId) REFERENCES WOVO.dbo.ContactGroup(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.ContactGroupCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_ContactGroupId ON WOVO.dbo.ContactGroupCultureText (  ContactGroupId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.ContactGroupCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CountryCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.CountryCultureText;
GO

CREATE TABLE WOVO.dbo.CountryCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CountryId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.CountryCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CountryCultureText_dbo.Country_CountryId] FOREIGN KEY (CountryId) REFERENCES WOVO.dbo.Country(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CountryCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CountryId ON WOVO.dbo.CountryCultureText (  CountryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.CountryCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CultureCodeCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.CultureCodeCultureText;
GO

CREATE TABLE WOVO.dbo.CultureCodeCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	[Text] nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCodeId int NOT NULL,
	LanguageId int NULL,
	CONSTRAINT [PK_dbo.CultureCodeCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CultureCodeCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CultureCodeCultureText_dbo.CultureCode_LanguageId] FOREIGN KEY (LanguageId) REFERENCES WOVO.dbo.CultureCode(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.CultureCodeCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_LanguageId ON WOVO.dbo.CultureCodeCultureText (  LanguageId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CultureResource definition

-- Drop table

-- DROP TABLE WOVO.dbo.CultureResource;
GO

CREATE TABLE WOVO.dbo.CultureResource (
	Id int IDENTITY(1,1) NOT NULL,
	ResourceId int NOT NULL,
	CultureCodeId int NOT NULL,
	value nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.CultureResource] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CultureResource_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CultureResource_dbo.ResourceKey_ResourceId] FOREIGN KEY (ResourceId) REFERENCES WOVO.dbo.ResourceKey(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.CultureResource (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ResourceId ON WOVO.dbo.CultureResource (  ResourceId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.EmergencyContact definition

-- Drop table

-- DROP TABLE WOVO.dbo.EmergencyContact;
GO

CREATE TABLE WOVO.dbo.EmergencyContact (
	Id int IDENTITY(1,1) NOT NULL,
	CountryId int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	isGlobal bit NOT NULL,
	CONSTRAINT [PK_dbo.EmergencyContact] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.EmergencyContact_dbo.Country_CountryId] FOREIGN KEY (CountryId) REFERENCES WOVO.dbo.Country(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CountryId ON WOVO.dbo.EmergencyContact (  CountryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.EmergencyContactCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.EmergencyContactCultureText;
GO

CREATE TABLE WOVO.dbo.EmergencyContactCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EmergencyInfo nvarchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EmergencyContactId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.EmergencyContactCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.EmergencyContactCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.EmergencyContactCultureText_dbo.EmergencyContact_EmergencyContactId] FOREIGN KEY (EmergencyContactId) REFERENCES WOVO.dbo.EmergencyContact(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.EmergencyContactCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_EmergencyContactId ON WOVO.dbo.EmergencyContactCultureText (  EmergencyContactId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.FAQ definition

-- Drop table

-- DROP TABLE WOVO.dbo.FAQ;
GO

CREATE TABLE WOVO.dbo.FAQ (
	Id int IDENTITY(1,1) NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CompanyId int NULL,
	CONSTRAINT [PK_dbo.FAQ] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.FAQ_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.FAQ (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.FAQCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.FAQCultureText;
GO

CREATE TABLE WOVO.dbo.FAQCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Question nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Answer nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FAQId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.FAQCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.FAQCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.FAQCultureText_dbo.FAQ_FAQId] FOREIGN KEY (FAQId) REFERENCES WOVO.dbo.FAQ(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.FAQCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_FAQId ON WOVO.dbo.FAQCultureText (  FAQId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.GenderCultureCode definition

-- Drop table

-- DROP TABLE WOVO.dbo.GenderCultureCode;
GO

CREATE TABLE WOVO.dbo.GenderCultureCode (
	Id int IDENTITY(1,1) NOT NULL,
	GenderName nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	GenderId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.GenderCultureCode] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.GenderCultureCode_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.GenderCultureCode_dbo.Gender_GenderId] FOREIGN KEY (GenderId) REFERENCES WOVO.dbo.Gender(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.GenderCultureCode (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_GenderId ON WOVO.dbo.GenderCultureCode (  GenderId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.GroupContact definition

-- Drop table

-- DROP TABLE WOVO.dbo.GroupContact;
GO

CREATE TABLE WOVO.dbo.GroupContact (
	Id int IDENTITY(1,1) NOT NULL,
	ContactGroupId int NOT NULL,
	UserId int NULL,
	ParticipantIdentifier nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CREATED datetime NULL,
	CONSTRAINT [PK_dbo.GroupContact] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.GroupContact_dbo.ContactGroup_ContactGroupId] FOREIGN KEY (ContactGroupId) REFERENCES WOVO.dbo.ContactGroup(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_ContactGroupId ON WOVO.dbo.GroupContact (  ContactGroupId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.GroupContact (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX nci_wi_GroupContact_D2EA5842E1C5552470BB80B6E734D49C ON WOVO.dbo.GroupContact (  ParticipantIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.LocationCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.LocationCultureText;
GO

CREATE TABLE WOVO.dbo.LocationCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	LocationName nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LocationId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.LocationCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.LocationCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.LocationCultureText_dbo.Location_LocationId] FOREIGN KEY (LocationId) REFERENCES WOVO.dbo.Location(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.LocationCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_LocationId ON WOVO.dbo.LocationCultureText (  LocationId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.MessageCategoryCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.MessageCategoryCultureText;
GO

CREATE TABLE WOVO.dbo.MessageCategoryCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Description nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MessageCategoryId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.MessageCategoryCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.MessageCategoryCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.MessageCategoryCultureText_dbo.MessageCategory_MessageCategoryId] FOREIGN KEY (MessageCategoryId) REFERENCES WOVO.dbo.MessageCategory(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.MessageCategoryCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_MessageCategoryId ON WOVO.dbo.MessageCategoryCultureText (  MessageCategoryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.MessageCategoryKeyword definition

-- Drop table

-- DROP TABLE WOVO.dbo.MessageCategoryKeyword;
GO

CREATE TABLE WOVO.dbo.MessageCategoryKeyword (
	Id int IDENTITY(1,1) NOT NULL,
	MessageCategoryId int NOT NULL,
	WordList nvarchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CultureCodeId int NULL,
	CONSTRAINT [PK_dbo.MessageCategoryKeyword] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.MessageCategoryKeyword_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id),
	CONSTRAINT [FK_dbo.MessageCategoryKeyword_dbo.MessageCategory_MessageCategoryId] FOREIGN KEY (MessageCategoryId) REFERENCES WOVO.dbo.MessageCategory(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.MessageCategoryKeyword (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_MessageCategoryId ON WOVO.dbo.MessageCategoryKeyword (  MessageCategoryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.MessageTypeCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.MessageTypeCultureText;
GO

CREATE TABLE WOVO.dbo.MessageTypeCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ShortNotes nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MessageTypeId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.MessageTypeCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.MessageTypeCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.MessageTypeCultureText_dbo.MessageType_MessageTypeId] FOREIGN KEY (MessageTypeId) REFERENCES WOVO.dbo.MessageType(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.MessageTypeCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_MessageTypeId ON WOVO.dbo.MessageTypeCultureText (  MessageTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.Module definition

-- Drop table

-- DROP TABLE WOVO.dbo.Module;
GO

CREATE TABLE WOVO.dbo.Module (
	Id int IDENTITY(1,1) NOT NULL,
	ParentId int NULL,
	Deleted bit NOT NULL,
	ClaimName nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Type] int NULL,
	CONSTRAINT [PK_dbo.Module] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Module_dbo.Module_ParentId] FOREIGN KEY (ParentId) REFERENCES WOVO.dbo.Module(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_ParentId ON WOVO.dbo.Module (  ParentId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ModuleCompany definition

-- Drop table

-- DROP TABLE WOVO.dbo.ModuleCompany;
GO

CREATE TABLE WOVO.dbo.ModuleCompany (
	Module_Id int NOT NULL,
	Company_Id int NOT NULL,
	CONSTRAINT [PK_dbo.ModuleCompany] PRIMARY KEY (Module_Id,Company_Id),
	CONSTRAINT [FK_dbo.ModuleCompany_dbo.Company_Company_Id] FOREIGN KEY (Company_Id) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.ModuleCompany_dbo.Module_Module_Id] FOREIGN KEY (Module_Id) REFERENCES WOVO.dbo.Module(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_Company_Id ON WOVO.dbo.ModuleCompany (  Company_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_Module_Id ON WOVO.dbo.ModuleCompany (  Module_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ModuleCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.ModuleCultureText;
GO

CREATE TABLE WOVO.dbo.ModuleCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	ModuleId int NOT NULL,
	Name nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.ModuleCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.ModuleCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.ModuleCultureText_dbo.Module_ModuleId] FOREIGN KEY (ModuleId) REFERENCES WOVO.dbo.Module(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.ModuleCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ModuleId ON WOVO.dbo.ModuleCultureText (  ModuleId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PICCategory definition

-- Drop table

-- DROP TABLE WOVO.dbo.PICCategory;
GO

CREATE TABLE WOVO.dbo.PICCategory (
	Id int IDENTITY(1,1) NOT NULL,
	CaseTypeId int NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	isGlobal bit NOT NULL,
	CONSTRAINT [PK_dbo.PICCategory] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.PICCategory_dbo.CaseType_CaseTypeId] FOREIGN KEY (CaseTypeId) REFERENCES WOVO.dbo.CaseType(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CaseTypeId ON WOVO.dbo.PICCategory (  CaseTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PICCategoryCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.PICCategoryCultureText;
GO

CREATE TABLE WOVO.dbo.PICCategoryCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PICCategoryId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.PICCategoryCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.PICCategoryCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.PICCategoryCultureText_dbo.PICCategory_PICCategoryId] FOREIGN KEY (PICCategoryId) REFERENCES WOVO.dbo.PICCategory(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.PICCategoryCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PICCategoryId ON WOVO.dbo.PICCategoryCultureText (  PICCategoryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ParticipantImport definition

-- Drop table

-- DROP TABLE WOVO.dbo.ParticipantImport;
GO

CREATE TABLE WOVO.dbo.ParticipantImport (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyAttachmentId int NOT NULL,
	PhoneNumber nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FirstName nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LastName nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DateOfBirth nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Gender nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EmployeeId nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PostalCode nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Status int NOT NULL,
	Reason nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EmployeeStatus nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	isSmartPhone nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	WorkerStartDate nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.ParticipantImport] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.ParticipantImport_dbo.CompanyAttachment_CompanyAttachmentId] FOREIGN KEY (CompanyAttachmentId) REFERENCES WOVO.dbo.CompanyAttachment(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyAttachmentId ON WOVO.dbo.ParticipantImport (  CompanyAttachmentId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_FirstName ON WOVO.dbo.ParticipantImport (  FirstName ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_LastName ON WOVO.dbo.ParticipantImport (  LastName ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ParticipantImportCustomField definition

-- Drop table

-- DROP TABLE WOVO.dbo.ParticipantImportCustomField;
GO

CREATE TABLE WOVO.dbo.ParticipantImportCustomField (
	Id int IDENTITY(1,1) NOT NULL,
	ParticipantImportId int NOT NULL,
	FieldName nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Value nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.ParticipantImportCustomField] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.ParticipantImportCustomField_dbo.ParticipantImport_ParticipantImportId] FOREIGN KEY (ParticipantImportId) REFERENCES WOVO.dbo.ParticipantImport(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_ParticipantImportId ON WOVO.dbo.ParticipantImportCustomField (  ParticipantImportId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.Payslip definition

-- Drop table

-- DROP TABLE WOVO.dbo.Payslip;
GO

CREATE TABLE WOVO.dbo.Payslip (
	Id int IDENTITY(1,1) NOT NULL,
	[Month] int NOT NULL,
	[Year] int NOT NULL,
	CompanyAttachmentId int NULL,
	Status int NOT NULL,
	ScheduledDate datetime NULL,
	Title nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Message nvarchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	isFeatured bit NOT NULL,
	TeaserImageId int NULL,
	StartDate datetime NOT NULL,
	FeaturedItemMessage nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ThumbnailImageUrl nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EndDate datetime NULL,
	CompanyId int NOT NULL,
	FeaturedStartDate datetime NULL,
	Description nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ToReceiveEmail bit NOT NULL,
	CONSTRAINT [PK_dbo.Payslip] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Payslip_dbo.CompanyAttachment_CompanyAttachmentId] FOREIGN KEY (CompanyAttachmentId) REFERENCES WOVO.dbo.CompanyAttachment(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyAttachmentId ON WOVO.dbo.Payslip (  CompanyAttachmentId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PayslipCommunicationChannel definition

-- Drop table

-- DROP TABLE WOVO.dbo.PayslipCommunicationChannel;
GO

CREATE TABLE WOVO.dbo.PayslipCommunicationChannel (
	Id int IDENTITY(1,1) NOT NULL,
	PayslipId int NOT NULL,
	CommunicationChannelId int NULL,
	CONSTRAINT [PK_dbo.PayslipCommunicationChannel] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.PayslipCommunicationChannel_dbo.CommunicationChannel_CommunicationChannelId] FOREIGN KEY (CommunicationChannelId) REFERENCES WOVO.dbo.CommunicationChannel(Id),
	CONSTRAINT [FK_dbo.PayslipCommunicationChannel_dbo.Payslip_PayslipId] FOREIGN KEY (PayslipId) REFERENCES WOVO.dbo.Payslip(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CommunicationChannelId ON WOVO.dbo.PayslipCommunicationChannel (  CommunicationChannelId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PayslipId ON WOVO.dbo.PayslipCommunicationChannel (  PayslipId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PayslipDocument definition

-- Drop table

-- DROP TABLE WOVO.dbo.PayslipDocument;
GO

CREATE TABLE WOVO.dbo.PayslipDocument (
	Id int IDENTITY(1,1) NOT NULL,
	PayslipId int NOT NULL,
	CompanyEmployeeIDNum nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PhoneNumber nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CompanyAttachmentId int NULL,
	ShortURL nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Status int NOT NULL,
	ParticipantIdentifier nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	IsPaySlipSent bit NOT NULL,
	JsonData nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	JsonDataDuplicate nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.PayslipDocument] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.PayslipDocument_dbo.CompanyAttachment_CompanyAttachmentId] FOREIGN KEY (CompanyAttachmentId) REFERENCES WOVO.dbo.CompanyAttachment(Id),
	CONSTRAINT [FK_dbo.PayslipDocument_dbo.Payslip_PayslipId] FOREIGN KEY (PayslipId) REFERENCES WOVO.dbo.Payslip(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyAttachmentId ON WOVO.dbo.PayslipDocument (  CompanyAttachmentId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PayslipDocument_Id_JsonData ON WOVO.dbo.PayslipDocument (  Id ASC  )
	 INCLUDE ( CompanyEmployeeIDNum , JsonData , PayslipId )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PayslipDocument_Lookup ON WOVO.dbo.PayslipDocument (  CompanyEmployeeIDNum ASC  , PayslipId ASC  )
	 INCLUDE ( JsonData )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PayslipId ON WOVO.dbo.PayslipDocument (  PayslipId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PayslipErrorLog definition

-- Drop table

-- DROP TABLE WOVO.dbo.PayslipErrorLog;
GO

CREATE TABLE WOVO.dbo.PayslipErrorLog (
	Id int IDENTITY(1,1) NOT NULL,
	PayslipId int NOT NULL,
	RowNo nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ErrorDescription nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.PayslipErrorLog] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.PayslipErrorLog_dbo.Payslip_PayslipId] FOREIGN KEY (PayslipId) REFERENCES WOVO.dbo.Payslip(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_PayslipId ON WOVO.dbo.PayslipErrorLog (  PayslipId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PayslipGroup definition

-- Drop table

-- DROP TABLE WOVO.dbo.PayslipGroup;
GO

CREATE TABLE WOVO.dbo.PayslipGroup (
	Id int IDENTITY(1,1) NOT NULL,
	PayslipId int NOT NULL,
	ContactGroupId int NULL,
	DepartmentId int NULL,
	CustomFieldId int NULL,
	CONSTRAINT [PK_dbo.PayslipGroup] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.PayslipGroup_dbo.ContactGroup_ContactGroupId] FOREIGN KEY (ContactGroupId) REFERENCES WOVO.dbo.ContactGroup(Id),
	CONSTRAINT [FK_dbo.PayslipGroup_dbo.Payslip_PayslipId] FOREIGN KEY (PayslipId) REFERENCES WOVO.dbo.Payslip(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_ContactGroupId ON WOVO.dbo.PayslipGroup (  ContactGroupId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PayslipId ON WOVO.dbo.PayslipGroup (  PayslipId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.Phone definition

-- Drop table

-- DROP TABLE WOVO.dbo.Phone;
GO

CREATE TABLE WOVO.dbo.Phone (
	Id int IDENTITY(1,1) NOT NULL,
	ParticipantId int NULL,
	TypeId int NULL,
	IsPrimary bit NOT NULL,
	IsMessages bit NOT NULL,
	IsText bit NOT NULL,
	Number nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CleanNumber nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Extension nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CountryCode nvarchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.Phone] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Phone_dbo.Participant_ParticipantId] FOREIGN KEY (ParticipantId) REFERENCES WOVO.dbo.Participant(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_ParticipantId ON WOVO.dbo.Phone (  ParticipantId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PostStatusCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.PostStatusCultureText;
GO

CREATE TABLE WOVO.dbo.PostStatusCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PostStatusId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.PostStatusCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.PostStatusCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.PostStatusCultureText_dbo.PostStatus_PostStatusId] FOREIGN KEY (PostStatusId) REFERENCES WOVO.dbo.PostStatus(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.PostStatusCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PostStatusId ON WOVO.dbo.PostStatusCultureText (  PostStatusId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.PostTypeCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.PostTypeCultureText;
GO

CREATE TABLE WOVO.dbo.PostTypeCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	shortNotes nvarchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PostTypeId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.PostTypeCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.PostTypeCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.PostTypeCultureText_dbo.PostType_PostTypeId] FOREIGN KEY (PostTypeId) REFERENCES WOVO.dbo.PostType(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.PostTypeCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PostTypeId ON WOVO.dbo.PostTypeCultureText (  PostTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.Questionnaire definition

-- Drop table

-- DROP TABLE WOVO.dbo.Questionnaire;
GO

CREATE TABLE WOVO.dbo.Questionnaire (
	Id int IDENTITY(1,1) NOT NULL,
	ShareWithCompany bit NOT NULL,
	isEditableByCompany bit NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	StartDate datetime NOT NULL,
	EndDate datetime NULL,
	CompanyId int NOT NULL,
	CONSTRAINT [PK_dbo.Questionnaire] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Questionnaire_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.Questionnaire (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.QuestionnaireCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.QuestionnaireCultureText;
GO

CREATE TABLE WOVO.dbo.QuestionnaireCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	QuestionnaireId int NOT NULL,
	Description nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Text] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.QuestionnaireCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.QuestionnaireCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.QuestionnaireCultureText_dbo.Questionnaire_QuestionnaireId] FOREIGN KEY (QuestionnaireId) REFERENCES WOVO.dbo.Questionnaire(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.QuestionnaireCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_QuestionnaireId ON WOVO.dbo.QuestionnaireCultureText (  QuestionnaireId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.QuestionnaireQuestion definition

-- Drop table

-- DROP TABLE WOVO.dbo.QuestionnaireQuestion;
GO

CREATE TABLE WOVO.dbo.QuestionnaireQuestion (
	Id int IDENTITY(1,1) NOT NULL,
	QuestionnaireId int NOT NULL,
	OrderNumber int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.QuestionnaireQuestion] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.QuestionnaireQuestion_dbo.Questionnaire_QuestionnaireId] FOREIGN KEY (QuestionnaireId) REFERENCES WOVO.dbo.Questionnaire(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_QuestionnaireId ON WOVO.dbo.QuestionnaireQuestion (  QuestionnaireId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.QuestionnaireQuestionCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.QuestionnaireQuestionCultureText;
GO

CREATE TABLE WOVO.dbo.QuestionnaireQuestionCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	QuestionnaireQuestionId int NOT NULL,
	[Text] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.QuestionnaireQuestionCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.QuestionnaireQuestionCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.QuestionnaireQuestionCultureText_dbo.QuestionnaireQuestion_QuestionnaireQuestionId] FOREIGN KEY (QuestionnaireQuestionId) REFERENCES WOVO.dbo.QuestionnaireQuestion(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.QuestionnaireQuestionCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_QuestionnaireQuestionId ON WOVO.dbo.QuestionnaireQuestionCultureText (  QuestionnaireQuestionId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ResponseTypeCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.ResponseTypeCultureText;
GO

CREATE TABLE WOVO.dbo.ResponseTypeCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	[Text] nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ResponseTypeId int NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.ResponseTypeCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.ResponseTypeCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.ResponseTypeCultureText_dbo.ResponseType_ResponseTypeId] FOREIGN KEY (ResponseTypeId) REFERENCES WOVO.dbo.ResponseType(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.ResponseTypeCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ResponseTypeId ON WOVO.dbo.ResponseTypeCultureText (  ResponseTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.[Role] definition

-- Drop table

-- DROP TABLE WOVO.dbo.[Role];
GO

CREATE TABLE WOVO.dbo.[Role] (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	isActive bit NOT NULL,
	IsSystem bit NOT NULL,
	InheritedId int NULL,
	IsHidden bit NOT NULL,
	pg_id int NULL,
	CONSTRAINT [PK_dbo.Role] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Role_dbo.Role_InheritedId] FOREIGN KEY (InheritedId) REFERENCES WOVO.dbo.[Role](Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_InheritedId ON WOVO.dbo.Role (  InheritedId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.RoleModule definition

-- Drop table

-- DROP TABLE WOVO.dbo.RoleModule;
GO

CREATE TABLE WOVO.dbo.RoleModule (
	Role_Id int NOT NULL,
	Module_Id int NOT NULL,
	CONSTRAINT [PK_dbo.RoleModule] PRIMARY KEY (Role_Id,Module_Id),
	CONSTRAINT [FK_dbo.RoleModule_dbo.Module_Module_Id] FOREIGN KEY (Module_Id) REFERENCES WOVO.dbo.Module(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.RoleModule_dbo.Role_Role_Id] FOREIGN KEY (Role_Id) REFERENCES WOVO.dbo.[Role](Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_Module_Id ON WOVO.dbo.RoleModule (  Module_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_Role_Id ON WOVO.dbo.RoleModule (  Role_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.SMSProviderPhoneNumber definition

-- Drop table

-- DROP TABLE WOVO.dbo.SMSProviderPhoneNumber;
GO

CREATE TABLE WOVO.dbo.SMSProviderPhoneNumber (
	Id int IDENTITY(1,1) NOT NULL,
	SMSProviderId int NOT NULL,
	PhoneNumber nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Type] int NOT NULL,
	APIKey nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	APIUName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	APIPasword nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.SMSProviderPhoneNumber] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.SMSProviderPhoneNumber_dbo.SMSProvider_SMSProviderId] FOREIGN KEY (SMSProviderId) REFERENCES WOVO.dbo.SMSProvider(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_SMSProviderId ON WOVO.dbo.SMSProviderPhoneNumber (  SMSProviderId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.TagCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.TagCultureText;
GO

CREATE TABLE WOVO.dbo.TagCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(250) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TagId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.TagCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.TagCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.TagCultureText_dbo.Tag_TagId] FOREIGN KEY (TagId) REFERENCES WOVO.dbo.Tag(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.TagCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_TagId ON WOVO.dbo.TagCultureText (  TagId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.TagFAQ definition

-- Drop table

-- DROP TABLE WOVO.dbo.TagFAQ;
GO

CREATE TABLE WOVO.dbo.TagFAQ (
	Tag_Id int NOT NULL,
	FAQ_Id int NOT NULL,
	CONSTRAINT [PK_dbo.TagFAQ] PRIMARY KEY (Tag_Id,FAQ_Id),
	CONSTRAINT [FK_dbo.TagFAQ_dbo.FAQ_FAQ_Id] FOREIGN KEY (FAQ_Id) REFERENCES WOVO.dbo.FAQ(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.TagFAQ_dbo.Tag_Tag_Id] FOREIGN KEY (Tag_Id) REFERENCES WOVO.dbo.Tag(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_FAQ_Id ON WOVO.dbo.TagFAQ (  FAQ_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_Tag_Id ON WOVO.dbo.TagFAQ (  Tag_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.[User] definition

-- Drop table

-- DROP TABLE WOVO.dbo.[User];
GO

CREATE TABLE WOVO.dbo.[User] (
	Id int NOT NULL,
	FirstName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LastName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Email nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UserName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Password nvarchar(256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PhoneNumber nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCodeId int NULL,
	DateTimeZone nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EmailNotifications bit NOT NULL,
	LoginDate datetime NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	SecondaryEmail nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CompanyEmployeeIDNum nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DeviceToken nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DeviceType int NOT NULL,
	DeviceVersion nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UserOTP nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UserOTPCreationDate datetime NULL,
	ParticipantIdentifier nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LastCompanyId int NULL,
	WeChatId nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LastChannelId int NULL,
	CustFieldDepartmentId int NULL,
	CustFieldDepartmentName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Longitude real NULL,
	Latitude real NULL,
	isEmergency bit NOT NULL,
	UserStatus int NULL,
	OTPValidated bit NULL,
	isSelfRegister bit NOT NULL,
	[role] nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AppRegistrationDate datetime NULL,
	WeChatRegistrationDate datetime NULL,
	SMSRegistrationDate datetime NULL,
	IsUserLoggedIn bit NOT NULL,
	AppVersion varchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	isZawgyiFontSelected bit NOT NULL,
	LastSyncTime datetime NULL,
	CONSTRAINT [PK_dbo.UserNew] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.User_dbo.CommunicationChannel_LastChannelId] FOREIGN KEY (LastChannelId) REFERENCES WOVO.dbo.CommunicationChannel(Id),
	CONSTRAINT [FK_dbo.User_dbo.Company_LastSelectedId] FOREIGN KEY (LastCompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.User_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id)
);
GO


-- WOVO.dbo.UserChannelRegistration definition

-- Drop table

-- DROP TABLE WOVO.dbo.UserChannelRegistration;
GO

CREATE TABLE WOVO.dbo.UserChannelRegistration (
	Id int IDENTITY(1,1) NOT NULL,
	UserId int NOT NULL,
	ChannelId int NOT NULL,
	Created datetime NOT NULL,
	CONSTRAINT [PK_dbo.UserChannelRegistration] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.UserChannelRegistration_dbo.CommunicationChannel_ChannelId] FOREIGN KEY (ChannelId) REFERENCES WOVO.dbo.CommunicationChannel(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_ChannelId ON WOVO.dbo.UserChannelRegistration (  ChannelId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.UserChannelRegistration (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.UserCompanyMapping definition

-- Drop table

-- DROP TABLE WOVO.dbo.UserCompanyMapping;
GO

CREATE TABLE WOVO.dbo.UserCompanyMapping (
	Id int IDENTITY(1,1) NOT NULL,
	UserId int NULL,
	CompanyId int NULL,
	CONSTRAINT [PK_dbo.UserCompanyMapping] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.UserCompanyMapping_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.UserCompanyMapping (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.UserCompanyMapping (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.UserPICCategoryMapping definition

-- Drop table

-- DROP TABLE WOVO.dbo.UserPICCategoryMapping;
GO

CREATE TABLE WOVO.dbo.UserPICCategoryMapping (
	Id int IDENTITY(1,1) NOT NULL,
	UserId int NULL,
	PICCategoryId int NULL,
	CONSTRAINT [PK_dbo.UserPICCategoryMapping] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.UserPICCategoryMapping_dbo.PICCategory_PICCategoryId] FOREIGN KEY (PICCategoryId) REFERENCES WOVO.dbo.PICCategory(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_PICCategoryId ON WOVO.dbo.UserPICCategoryMapping (  PICCategoryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.UserPICCategoryMapping (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.UserRole definition

-- Drop table

-- DROP TABLE WOVO.dbo.UserRole;
GO

CREATE TABLE WOVO.dbo.UserRole (
	User_Id int NOT NULL,
	Role_Id int NOT NULL,
	CONSTRAINT [PK_dbo.UserRole] PRIMARY KEY (User_Id,Role_Id),
	CONSTRAINT [FK_dbo.UserRole_dbo.Role_Role_Id] FOREIGN KEY (Role_Id) REFERENCES WOVO.dbo.[Role](Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_Role_Id ON WOVO.dbo.UserRole (  Role_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_User_Id ON WOVO.dbo.UserRole (  User_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.tblUserDataMapping definition

-- Drop table

-- DROP TABLE WOVO.dbo.tblUserDataMapping;
GO

CREATE TABLE WOVO.dbo.tblUserDataMapping (
	Id int IDENTITY(1,1) NOT NULL,
	UserId int NULL,
	DeviceId nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	AvtarId int NOT NULL,
	SecretQuestionId int NOT NULL,
	SecretQuestionAnswer nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT [PK_dbo.tblUserDataMapping] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.tblUserDataMapping_tblAvatar_Id] FOREIGN KEY (AvtarId) REFERENCES WOVO.dbo.tblAvatar(Id),
	CONSTRAINT [FK_dbo.tblUserDataMapping_tblSecretQuestions_Id] FOREIGN KEY (SecretQuestionId) REFERENCES WOVO.dbo.tblSecretQuestions(Id)
);
GO


-- WOVO.dbo.AutoResponse definition

-- Drop table

-- DROP TABLE WOVO.dbo.AutoResponse;
GO

CREATE TABLE WOVO.dbo.AutoResponse (
	Id int IDENTITY(1,1) NOT NULL,
	ResponseTypeId int NOT NULL,
	CompanyId int NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.AutoResponse] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.AutoResponse_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.AutoResponse_dbo.ResponseType_ResponseTypeId] FOREIGN KEY (ResponseTypeId) REFERENCES WOVO.dbo.ResponseType(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.AutoResponse (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ResponseTypeId ON WOVO.dbo.AutoResponse (  ResponseTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.AutoResponseCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.AutoResponseCultureText;
GO

CREATE TABLE WOVO.dbo.AutoResponseCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Response nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AutoResponseId int NOT NULL,
	CultureCodeId int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	Title nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.AutoResponseCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.AutoResponseCultureText_dbo.AutoResponse_AutoResponseId] FOREIGN KEY (AutoResponseId) REFERENCES WOVO.dbo.AutoResponse(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.AutoResponseCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_AutoResponseId ON WOVO.dbo.AutoResponseCultureText (  AutoResponseId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.AutoResponseCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.[Case] definition

-- Drop table

-- DROP TABLE WOVO.dbo.[Case];
GO

CREATE TABLE WOVO.dbo.[Case] (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CaseStatusId int NOT NULL,
	Priority int NOT NULL,
	ResolutionBy datetime NULL,
	AssingedById int NULL,
	AssingedDate datetime NULL,
	ResolvedDate datetime NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CaseTypeId int NULL,
	AssignedToId int NULL,
	PICCategoryId int NULL,
	isShowMyDetails bit NOT NULL,
	DepartmentId int NULL,
	DepartmentName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CompanyId int NOT NULL,
	CONSTRAINT [PK_dbo.Case] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Case_dbo.CaseStatus_CaseStatusId] FOREIGN KEY (CaseStatusId) REFERENCES WOVO.dbo.CaseStatus(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.Case_dbo.CaseType_CaseTypeId_Id] FOREIGN KEY (CaseTypeId) REFERENCES WOVO.dbo.CaseType(Id),
	CONSTRAINT [FK_dbo.Case_dbo.PICCategory_PICCategoryId] FOREIGN KEY (PICCategoryId) REFERENCES WOVO.dbo.PICCategory(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_AssignedToId ON WOVO.dbo.[Case] (  AssignedToId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_AssingedById ON WOVO.dbo.[Case] (  AssingedById ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CaseStatusId ON WOVO.dbo.[Case] (  CaseStatusId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CaseTypeId ON WOVO.dbo.[Case] (  CaseTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PICCategoryId ON WOVO.dbo.[Case] (  PICCategoryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CaseNote definition

-- Drop table

-- DROP TABLE WOVO.dbo.CaseNote;
GO

CREATE TABLE WOVO.dbo.CaseNote (
	Id int IDENTITY(1,1) NOT NULL,
	CaseId int NOT NULL,
	Notes nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UserId int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	ConnectAttachmentId int NULL,
	CONSTRAINT [PK_dbo.CaseNote] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CaseNote_dbo.Case_CaseId] FOREIGN KEY (CaseId) REFERENCES WOVO.dbo.[Case](Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CaseNote_dbo.ConnectAttachment_ConnectAttachmentId] FOREIGN KEY (ConnectAttachmentId) REFERENCES WOVO.dbo.ConnectAttachment(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CaseId ON WOVO.dbo.CaseNote (  CaseId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ConnectAttachmentId ON WOVO.dbo.CaseNote (  ConnectAttachmentId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.CaseNote (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CaseSurvey definition

-- Drop table

-- DROP TABLE WOVO.dbo.CaseSurvey;
GO

CREATE TABLE WOVO.dbo.CaseSurvey (
	Id int IDENTITY(1,1) NOT NULL,
	CaseId int NOT NULL,
	UserId int NOT NULL,
	Rating bit NOT NULL,
	RatingDate datetime NULL,
	CONSTRAINT [PK_dbo.CaseSurvey] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CaseSurvey_dbo.Case_CaseId] FOREIGN KEY (CaseId) REFERENCES WOVO.dbo.[Case](Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CaseId ON WOVO.dbo.CaseSurvey (  CaseId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.CaseSurvey (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CaseTypePICCategoryMap definition

-- Drop table

-- DROP TABLE WOVO.dbo.CaseTypePICCategoryMap;
GO

CREATE TABLE WOVO.dbo.CaseTypePICCategoryMap (
	Id int IDENTITY(1,1) NOT NULL,
	CaseTypeId int NULL,
	PICCategoryId int NULL,
	CONSTRAINT [PK_dbo.CaseTypePICCategoryMap] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CaseTypePICCategoryMap_dbo.CaseType_CaseTypeId] FOREIGN KEY (CaseTypeId) REFERENCES WOVO.dbo.CaseType(Id),
	CONSTRAINT [FK_dbo.CaseTypePICCategoryMap_dbo.PICCategory_PICCategoryId] FOREIGN KEY (PICCategoryId) REFERENCES WOVO.dbo.PICCategory(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CaseTypeId ON WOVO.dbo.CaseTypePICCategoryMap (  CaseTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PICCategoryId ON WOVO.dbo.CaseTypePICCategoryMap (  PICCategoryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyEmergencyContact definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyEmergencyContact;
GO

CREATE TABLE WOVO.dbo.CompanyEmergencyContact (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	GlobalEmergencyContactId int NULL,
	CountryId int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.CompanyEmergencyContact] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyEmergencyContact_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.CompanyEmergencyContact_dbo.Country_CountryId] FOREIGN KEY (CountryId) REFERENCES WOVO.dbo.Country(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyEmergencyContact_dbo.EmergencyContact_GlobalEmergencyContactId] FOREIGN KEY (GlobalEmergencyContactId) REFERENCES WOVO.dbo.EmergencyContact(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyEmergencyContact (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CountryId ON WOVO.dbo.CompanyEmergencyContact (  CountryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_GlobalEmergencyContactId ON WOVO.dbo.CompanyEmergencyContact (  GlobalEmergencyContactId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyEmergencyContactCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyEmergencyContactCultureText;
GO

CREATE TABLE WOVO.dbo.CompanyEmergencyContactCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EmergencyInfo nvarchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CompanyEmergencyContactId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.CompanyEmergencyContactCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyEmergencyContactCultureText_dbo.CompanyEmergencyContact_CompanyEmergencyContactId] FOREIGN KEY (CompanyEmergencyContactId) REFERENCES WOVO.dbo.CompanyEmergencyContact(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyEmergencyContactCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyEmergencyContactId ON WOVO.dbo.CompanyEmergencyContactCultureText (  CompanyEmergencyContactId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.CompanyEmergencyContactCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyEventGroup definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyEventGroup;
GO

CREATE TABLE WOVO.dbo.CompanyEventGroup (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyEventId int NOT NULL,
	ContactGroupId int NOT NULL,
	CONSTRAINT [PK_dbo.CompanyEventGroup] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyEventGroup_dbo.CompanyEvent_CompanyEventId] FOREIGN KEY (CompanyEventId) REFERENCES WOVO.dbo.CompanyEvent(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyEventGroup_dbo.ContactGroup_ContactGroupId] FOREIGN KEY (ContactGroupId) REFERENCES WOVO.dbo.ContactGroup(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyEventId ON WOVO.dbo.CompanyEventGroup (  CompanyEventId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ContactGroupId ON WOVO.dbo.CompanyEventGroup (  ContactGroupId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyNumber definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyNumber;
GO

CREATE TABLE WOVO.dbo.CompanyNumber (
	ProviderPhoneNumId int NOT NULL,
	CompanyId int NOT NULL,
	CONSTRAINT [PK_dbo.CompanyNumber] PRIMARY KEY (ProviderPhoneNumId,CompanyId),
	CONSTRAINT [FK_dbo.CompanyNumber_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.CompanyNumber_dbo.SMSProviderPhoneNumber_ProviderPhoneNumId] FOREIGN KEY (ProviderPhoneNumId) REFERENCES WOVO.dbo.SMSProviderPhoneNumber(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_ProviderPhoneNumId ON WOVO.dbo.CompanyNumber (  ProviderPhoneNumId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyPICCategory definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyPICCategory;
GO

CREATE TABLE WOVO.dbo.CompanyPICCategory (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	isInherited bit NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	PICCategoryId int NOT NULL,
	CONSTRAINT [PK_dbo.CompanyPICCategory] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyPICCategory_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.CompanyPICCategory_dbo.PICCategory_PICCategoryId] FOREIGN KEY (PICCategoryId) REFERENCES WOVO.dbo.PICCategory(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyPICCategory (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PICCategoryId ON WOVO.dbo.CompanyPICCategory (  PICCategoryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyPost definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyPost;
GO

CREATE TABLE WOVO.dbo.CompanyPost (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	StartDate datetime NOT NULL,
	PostTypeId int NOT NULL,
	TimeZone nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	LocationBased bit NOT NULL,
	CountryID int NULL,
	City nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PostCode nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Radius real NULL,
	Latitude real NULL,
	Longitude real NULL,
	PostStatusID int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	WeChatBroadCastID nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	WeChatBroadCastStatus bit NOT NULL,
	SurveyURL nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ChannelOption int NOT NULL,
	QuestionnaireId int NULL,
	IsFeatured bit NOT NULL,
	Message nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ThumbnailImageUrl nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FeatureItemEndDate datetime NULL,
	AttachmentUrl nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TeaserImageUrl nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FeatureItemStartDate datetime NULL,
	CONSTRAINT [PK_dbo.CompanyPost] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyPost_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.CompanyPost_dbo.Country_CountryID] FOREIGN KEY (CountryID) REFERENCES WOVO.dbo.Country(Id),
	CONSTRAINT [FK_dbo.CompanyPost_dbo.PostStatus_PostStatusID] FOREIGN KEY (PostStatusID) REFERENCES WOVO.dbo.PostStatus(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyPost_dbo.PostType_PostTypeId] FOREIGN KEY (PostTypeId) REFERENCES WOVO.dbo.PostType(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyPost_dbo.Questionnaire_QuestionnaireId] FOREIGN KEY (QuestionnaireId) REFERENCES WOVO.dbo.Questionnaire(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.CompanyPost (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CountryID ON WOVO.dbo.CompanyPost (  CountryID ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PostStatusID ON WOVO.dbo.CompanyPost (  PostStatusID ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PostTypeId ON WOVO.dbo.CompanyPost (  PostTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_QuestionnaireId ON WOVO.dbo.CompanyPost (  QuestionnaireId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyPostChannel definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyPostChannel;
GO

CREATE TABLE WOVO.dbo.CompanyPostChannel (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyPostId int NOT NULL,
	ChannelId int NOT NULL,
	CONSTRAINT [PK_dbo.CompanyPostChannel] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyPostChannel_dbo.CompanyPost_CompanyPostId] FOREIGN KEY (CompanyPostId) REFERENCES WOVO.dbo.CompanyPost(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyPostId ON WOVO.dbo.CompanyPostChannel (  CompanyPostId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyPostCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyPostCultureText;
GO

CREATE TABLE WOVO.dbo.CompanyPostCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyPostId int NOT NULL,
	CultureCodeId int NOT NULL,
	PostTitle nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PostContent nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AttachmentId int NULL,
	TeaserImageId int NULL,
	CONSTRAINT [PK_dbo.CompanyPostCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyPostCultureText_dbo.CompanyPost_CompanyPostId] FOREIGN KEY (CompanyPostId) REFERENCES WOVO.dbo.CompanyPost(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyPostCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyPostId ON WOVO.dbo.CompanyPostCultureText (  CompanyPostId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.CompanyPostCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyPostGroup definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyPostGroup;
GO

CREATE TABLE WOVO.dbo.CompanyPostGroup (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyPostId int NOT NULL,
	ContactGroupId int NULL,
	DepartmentId int NULL,
	CONSTRAINT [PK_dbo.CompanyPostGroup] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyPostGroup_dbo.CompanyPost_CompanyPostId] FOREIGN KEY (CompanyPostId) REFERENCES WOVO.dbo.CompanyPost(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyPostGroup_dbo.ContactGroup_ContactGroupId] FOREIGN KEY (ContactGroupId) REFERENCES WOVO.dbo.ContactGroup(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyPostId ON WOVO.dbo.CompanyPostGroup (  CompanyPostId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ContactGroupId ON WOVO.dbo.CompanyPostGroup (  ContactGroupId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyPostTag definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyPostTag;
GO

CREATE TABLE WOVO.dbo.CompanyPostTag (
	CompanyPostId int NOT NULL,
	TagId int NOT NULL,
	CONSTRAINT [PK_dbo.CompanyPostTag] PRIMARY KEY (CompanyPostId,TagId),
	CONSTRAINT [FK_dbo.CompanyPostTag_dbo.CompanyPost_CompanyPostId] FOREIGN KEY (CompanyPostId) REFERENCES WOVO.dbo.CompanyPost(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.CompanyPostTag_dbo.Tag_TagId] FOREIGN KEY (TagId) REFERENCES WOVO.dbo.Tag(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyPostId ON WOVO.dbo.CompanyPostTag (  CompanyPostId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_TagId ON WOVO.dbo.CompanyPostTag (  TagId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.FAQPICCategory definition

-- Drop table

-- DROP TABLE WOVO.dbo.FAQPICCategory;
GO

CREATE TABLE WOVO.dbo.FAQPICCategory (
	FAQ_Id int NOT NULL,
	PICCategory_Id int NOT NULL,
	CONSTRAINT [PK_dbo.FAQPICCategory] PRIMARY KEY (FAQ_Id,PICCategory_Id),
	CONSTRAINT [FK_dbo.FAQPICCategory_dbo.FAQ_FAQ_Id] FOREIGN KEY (FAQ_Id) REFERENCES WOVO.dbo.FAQ(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.FAQPICCategory_dbo.PICCategory_PICCategory_Id] FOREIGN KEY (PICCategory_Id) REFERENCES WOVO.dbo.PICCategory(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_FAQ_Id ON WOVO.dbo.FAQPICCategory (  FAQ_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PICCategory_Id ON WOVO.dbo.FAQPICCategory (  PICCategory_Id ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.Favourite definition

-- Drop table

-- DROP TABLE WOVO.dbo.Favourite;
GO

CREATE TABLE WOVO.dbo.Favourite (
	Id int IDENTITY(1,1) NOT NULL,
	UserId int NOT NULL,
	PostTypeId int NULL,
	CompanyPostId int NULL,
	CompanyEventId int NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.Favourite] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Favourite_dbo.CompanyEvent_CompanyEventId] FOREIGN KEY (CompanyEventId) REFERENCES WOVO.dbo.CompanyEvent(Id),
	CONSTRAINT [FK_dbo.Favourite_dbo.CompanyPost_CompanyPostId] FOREIGN KEY (CompanyPostId) REFERENCES WOVO.dbo.CompanyPost(Id),
	CONSTRAINT [FK_dbo.Favourite_dbo.PostType_PostTypeId] FOREIGN KEY (PostTypeId) REFERENCES WOVO.dbo.PostType(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyEventId ON WOVO.dbo.Favourite (  CompanyEventId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CompanyPostId ON WOVO.dbo.Favourite (  CompanyPostId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_PostTypeId ON WOVO.dbo.Favourite (  PostTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.Favourite (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.Message definition

-- Drop table

-- DROP TABLE WOVO.dbo.Message;
GO

CREATE TABLE WOVO.dbo.Message (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyId int NOT NULL,
	UserId int NOT NULL,
	MessageTypeId int NOT NULL,
	[When] datetime NULL,
	[Where] nvarchar(30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	MessageText nvarchar(1500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	AttachmentId int NULL,
	ChannelId int NOT NULL,
	ParentId int NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CultureCodeId int NULL,
	FAQId int NULL,
	MessageCategoryId int NULL,
	CaseId int NULL,
	ScheduleTime datetime NULL,
	MessageStatus int NULL,
	MessageAttachmentUrl nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT [PK_dbo.Message] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.Message_dbo.Case_CaseId] FOREIGN KEY (CaseId) REFERENCES WOVO.dbo.[Case](Id),
	CONSTRAINT [FK_dbo.Message_dbo.CommunicationChannel_ChannelId] FOREIGN KEY (ChannelId) REFERENCES WOVO.dbo.CommunicationChannel(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.Message_dbo.Company_CompanyId] FOREIGN KEY (CompanyId) REFERENCES WOVO.dbo.Company(Id),
	CONSTRAINT [FK_dbo.Message_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id),
	CONSTRAINT [FK_dbo.Message_dbo.FAQ_FAQId] FOREIGN KEY (FAQId) REFERENCES WOVO.dbo.FAQ(Id),
	CONSTRAINT [FK_dbo.Message_dbo.MessageCategory_MessageCategoryId] FOREIGN KEY (MessageCategoryId) REFERENCES WOVO.dbo.MessageCategory(Id),
	CONSTRAINT [FK_dbo.Message_dbo.MessageType_MessageTypeId] FOREIGN KEY (MessageTypeId) REFERENCES WOVO.dbo.MessageType(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.Message_dbo.Message_ParentId] FOREIGN KEY (ParentId) REFERENCES WOVO.dbo.Message(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CaseId ON WOVO.dbo.Message (  CaseId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ChannelId ON WOVO.dbo.Message (  ChannelId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CompanyId ON WOVO.dbo.Message (  CompanyId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.Message (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_FAQId ON WOVO.dbo.Message (  FAQId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_MessageCategoryId ON WOVO.dbo.Message (  MessageCategoryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_MessageTypeId ON WOVO.dbo.Message (  MessageTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ParentId ON WOVO.dbo.Message (  ParentId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.Message (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.QuestionnaireAnswer definition

-- Drop table

-- DROP TABLE WOVO.dbo.QuestionnaireAnswer;
GO

CREATE TABLE WOVO.dbo.QuestionnaireAnswer (
	Id int IDENTITY(1,1) NOT NULL,
	QuestionnaireQuestionId int NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.QuestionnaireAnswer] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.QuestionnaireAnswer_dbo.QuestionnaireQuestion_QuestionnaireQuestionId] FOREIGN KEY (QuestionnaireQuestionId) REFERENCES WOVO.dbo.QuestionnaireQuestion(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_QuestionnaireQuestionId ON WOVO.dbo.QuestionnaireAnswer (  QuestionnaireQuestionId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.QuestionnaireAnswerCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.QuestionnaireAnswerCultureText;
GO

CREATE TABLE WOVO.dbo.QuestionnaireAnswerCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	QuestionnaireAnswerId int NOT NULL,
	[Text] nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.QuestionnaireAnswerCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.QuestionnaireAnswerCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.QuestionnaireAnswerCultureText_dbo.QuestionnaireAnswer_QuestionnaireAnswerId] FOREIGN KEY (QuestionnaireAnswerId) REFERENCES WOVO.dbo.QuestionnaireAnswer(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.QuestionnaireAnswerCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_QuestionnaireAnswerId ON WOVO.dbo.QuestionnaireAnswerCultureText (  QuestionnaireAnswerId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.QuestionnaireResult definition

-- Drop table

-- DROP TABLE WOVO.dbo.QuestionnaireResult;
GO

CREATE TABLE WOVO.dbo.QuestionnaireResult (
	Id int IDENTITY(1,1) NOT NULL,
	QuestionnaireQuestionId int NOT NULL,
	CultureCodeId int NOT NULL,
	Deleted bit NOT NULL,
	CreatedBy int NOT NULL,
	Created datetime NOT NULL,
	ModifiedBy int NULL,
	Modified datetime NULL,
	CompanyPostResponseId int NULL,
	QuestionnaireAnswerId int NOT NULL,
	CONSTRAINT [PK_dbo.QuestionnaireResult] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.QuestionnaireResult_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.QuestionnaireResult_dbo.QuestionnaireAnswer_QuestionnaireAnswerId] FOREIGN KEY (QuestionnaireAnswerId) REFERENCES WOVO.dbo.QuestionnaireAnswer(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.QuestionnaireResult_dbo.QuestionnaireQuestion_QuestionnaireQuestionId] FOREIGN KEY (QuestionnaireQuestionId) REFERENCES WOVO.dbo.QuestionnaireQuestion(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyPostResponseId ON WOVO.dbo.QuestionnaireResult (  CompanyPostResponseId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.QuestionnaireResult (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_QuestionnaireAnswerId ON WOVO.dbo.QuestionnaireResult (  QuestionnaireAnswerId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_QuestionnaireQuestionId ON WOVO.dbo.QuestionnaireResult (  QuestionnaireQuestionId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ReportType definition

-- Drop table

-- DROP TABLE WOVO.dbo.ReportType;
GO

CREATE TABLE WOVO.dbo.ReportType (
	Id int IDENTITY(1,1) NOT NULL,
	isActive bit NOT NULL,
	CompanyReport bit NOT NULL,
	ReportFile nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	RoleId int NOT NULL,
	CONSTRAINT [PK_dbo.ReportType] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.ReportType_dbo.Role_RoleId] FOREIGN KEY (RoleId) REFERENCES WOVO.dbo.[Role](Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_RoleId ON WOVO.dbo.ReportType (  RoleId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.ReportTypeCultureText definition

-- Drop table

-- DROP TABLE WOVO.dbo.ReportTypeCultureText;
GO

CREATE TABLE WOVO.dbo.ReportTypeCultureText (
	Id int IDENTITY(1,1) NOT NULL,
	Name nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ReportTypeId int NOT NULL,
	CultureCodeId int NOT NULL,
	CONSTRAINT [PK_dbo.ReportTypeCultureText] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.ReportTypeCultureText_dbo.CultureCode_CultureCodeId] FOREIGN KEY (CultureCodeId) REFERENCES WOVO.dbo.CultureCode(Id) ON DELETE CASCADE,
	CONSTRAINT [FK_dbo.ReportTypeCultureText_dbo.ReportType_ReportTypeId] FOREIGN KEY (ReportTypeId) REFERENCES WOVO.dbo.ReportType(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CultureCodeId ON WOVO.dbo.ReportTypeCultureText (  CultureCodeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_ReportTypeId ON WOVO.dbo.ReportTypeCultureText (  ReportTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.SurveyResponse definition

-- Drop table

-- DROP TABLE WOVO.dbo.SurveyResponse;
GO

CREATE TABLE WOVO.dbo.SurveyResponse (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyPostId int NOT NULL,
	UserId int NULL,
	ParticipantIdentifier nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CustFieldDepartmentId int NULL,
	CustFieldDepartmentName nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Status bit NULL,
	ShortURL nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CommunicationChannelId int NULL,
	IsPostSent bit NOT NULL,
	Guid uniqueidentifier NOT NULL,
	IsNotificationSent bit NOT NULL,
	Created datetime NULL,
	Modified datetime NULL,
	CONSTRAINT [PK_dbo.SurveyResponse] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.SurveyResponse_dbo.CommunicationChannel_CommunicationChannelId] FOREIGN KEY (CommunicationChannelId) REFERENCES WOVO.dbo.CommunicationChannel(Id),
	CONSTRAINT [FK_dbo.SurveyResponse_dbo.CompanyPost_CompanyPostId] FOREIGN KEY (CompanyPostId) REFERENCES WOVO.dbo.CompanyPost(Id) ON DELETE CASCADE
);
GO
 CREATE NONCLUSTERED INDEX IX_CommunicationChannelId ON WOVO.dbo.SurveyResponse (  CommunicationChannelId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CompanyPostId ON WOVO.dbo.SurveyResponse (  CompanyPostId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_UserId ON WOVO.dbo.SurveyResponse (  UserId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_participantIdentifierNew ON WOVO.dbo.SurveyResponse (  ParticipantIdentifier ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX nci_wi_CompanyPostResponseNew ON WOVO.dbo.SurveyResponse (  UserId ASC  , Status ASC  )
	 INCLUDE ( CompanyPostId )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX nci_wi_CompanyPostResponseNewTable ON WOVO.dbo.SurveyResponse (  CompanyPostId ASC  , UserId ASC  )
	 INCLUDE ( CommunicationChannelId , Created , CustFieldDepartmentId , CustFieldDepartmentName , Guid , IsNotificationSent , IsPostSent , Modified , ParticipantIdentifier , ShortURL , Status )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- WOVO.dbo.CompanyCaseTypeCompanyPICCategoryMap definition

-- Drop table

-- DROP TABLE WOVO.dbo.CompanyCaseTypeCompanyPICCategoryMap;
GO

CREATE TABLE WOVO.dbo.CompanyCaseTypeCompanyPICCategoryMap (
	Id int IDENTITY(1,1) NOT NULL,
	CompanyCaseTypeId int NULL,
	CompanyPICCategoryId int NULL,
	CONSTRAINT [PK_dbo.CompanyCaseTypeCompanyPICCategoryMap] PRIMARY KEY (Id),
	CONSTRAINT [FK_dbo.CompanyCaseTypeCompanyPICCategoryMap_dbo.CompanyCaseType_CompanyCaseTypeId] FOREIGN KEY (CompanyCaseTypeId) REFERENCES WOVO.dbo.CompanyCaseType(Id),
	CONSTRAINT [FK_dbo.CompanyCaseTypeCompanyPICCategoryMap_dbo.CompanyPICCategory_CompanyPICCategoryId] FOREIGN KEY (CompanyPICCategoryId) REFERENCES WOVO.dbo.CompanyPICCategory(Id)
);
GO
 CREATE NONCLUSTERED INDEX IX_CompanyCaseTypeId ON WOVO.dbo.CompanyCaseTypeCompanyPICCategoryMap (  CompanyCaseTypeId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO
 CREATE NONCLUSTERED INDEX IX_CompanyPICCategoryId ON WOVO.dbo.CompanyCaseTypeCompanyPICCategoryMap (  CompanyPICCategoryId ASC  )
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
GO


-- dbo.vw_ConnectReportsTable source

