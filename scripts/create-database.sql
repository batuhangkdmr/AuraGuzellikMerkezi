-- Aura Güzellik Merkezi Database Schema
-- Hosting SQL Server için düzenlenmiş versiyon

USE sitenhaz_sitenhazirDb;
GO

-- Blogs Tablosu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Blogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Blogs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [title] NVARCHAR(200) NOT NULL,
        [slug] VARCHAR(250) NOT NULL UNIQUE,
        [content] NVARCHAR(MAX) NOT NULL,
        [excerpt] NVARCHAR(500) NULL,
        [image] VARCHAR(500) NULL,
        [published] BIT NOT NULL DEFAULT 0,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Blogs tablosu oluşturuldu.';
END
GO

-- Services Tablosu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Services]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Services] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(200) NOT NULL,
        [slug] VARCHAR(250) NOT NULL UNIQUE,
        [description] NVARCHAR(MAX) NOT NULL,
        [price] DECIMAL(18,2) NOT NULL,
        [duration] INT NOT NULL, -- dakika
        [image] VARCHAR(500) NULL,
        [active] BIT NOT NULL DEFAULT 1,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Services tablosu oluşturuldu.';
END
GO

-- Appointments Tablosu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Appointments] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [customerName] NVARCHAR(100) NOT NULL,
        [phone] VARCHAR(20) NOT NULL,
        [email] VARCHAR(100) NULL,
        [serviceId] INT NULL,
        [date] DATETIME2 NOT NULL,
        [time] VARCHAR(10) NOT NULL,
        [notes] NVARCHAR(500) NULL,
        [status] VARCHAR(50) NOT NULL DEFAULT 'pending',
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Appointments tablosu oluşturuldu.';
END
GO

-- Contacts Tablosu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Contacts] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(100) NOT NULL,
        [email] VARCHAR(100) NOT NULL,
        [phone] VARCHAR(20) NULL,
        [subject] NVARCHAR(200) NOT NULL,
        [message] NVARCHAR(MAX) NOT NULL,
        [isRead] BIT NOT NULL DEFAULT 0,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Contacts tablosu oluşturuldu.';
END
GO

-- Admins Tablosu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Admins]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Admins] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] VARCHAR(50) NOT NULL UNIQUE,
        [password] VARCHAR(500) NOT NULL,
        [email] VARCHAR(100) NOT NULL UNIQUE,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Admins tablosu oluşturuldu.';
END
GO

PRINT '✅ Tüm tablolar başarıyla oluşturuldu!';
GO

