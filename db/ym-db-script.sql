SELECT * from Plants

DROP TABLE Plants;
CREATE TABLE Plants (
PlantID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
Name varchar(255),
Description varchar(255),
Deleted bit DEFAULT 0);

INSERT Plants (Name, Description) 
VALUES('Zacatecas', 'Planta de producción');

DROP TABLE Users;
CREATE TABLE Users (
UserID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
Name varchar(255),
Lastname varchar(255),
Role varchar(255),
Username varchar(255),
Password varchar(255),
Deleted bit DEFAULT 0,
PlantID uniqueidentifier FOREIGN KEY REFERENCES Plants(PlantID));

INSERT Users (Name, LastName, Role, 
Username, Password, PlantID) 
VALUES('Pepe', 'Pérez', 'admin', 
'pepe.perez@company.com', 'contraseña', '755E95F5-A700-4FFF-9263-438A01414BF8');

SELECT * from Users u, Plants p where p.PlantID = u.PlantID;

DROP TABLE SystemLog;
CREATE TABLE SystemLog (
SystemLogID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
Operation varchar(255),
Date datetime NOT NULL,
Deleted bit DEFAULT 0,
UserID uniqueidentifier FOREIGN KEY REFERENCES Users(UserID));

INSERT SystemLog (Operation, Date, UserID) 
VALUES('Add user', CURRENT_TIMESTAMP, '1D073885-3BB6-4EC2-8494-DACDCD4D5C3F');

DROP TABLE Places;
CREATE TABLE Places (
PlaceID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
Type varchar(255) NOT NULL CHECK (Type IN('Box', 'Checkpoint')),
PlaceName varchar(255),
Deleted bit DEFAULT 0,
PlantID uniqueidentifier FOREIGN KEY REFERENCES Plants(PlantID));

INSERT Places (Type, PlaceName, PlantID) 
VALUES('Box', 'P1', '17EF311F-5728-4C45-999E-049B1A5177C9');

INSERT Places (Type, PlaceName) 
VALUES('Box', 'P2');

DROP TABLE Cameras;
CREATE TABLE Cameras (
CameraID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
IP varchar(255),
Model varchar(255),
Position varchar(255),
Deleted bit DEFAULT 0,
PlaceID uniqueidentifier FOREIGN KEY REFERENCES Places(PlaceID));

INSERT Cameras (IP, Model, Position, PlaceID) 
VALUES('192.120.10.2', 'Model1', 'Angular', '5A1CCADE-1BE3-4BDB-9B0C-02513D97E755');

DROP TABLE TrackVisits;
CREATE TABLE TrackVisits (
TrackVisitID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
Plate varchar(255),
SapTrackOrder varchar(255),
Shift int,
Finish bit,
Deleted bit DEFAULT 0);

INSERT TrackVisits (Plate, SapTrackOrder, Shift, Finish) 
VALUES('WFY-152', 'FG45FD46', 1, 0);

DROP TABLE Operations;
CREATE TABLE Operations (
SapFolio varchar(255) NOT NULL PRIMARY KEY,
TrackID uniqueidentifier FOREIGN KEY REFERENCES TrackVisits(TrackVisitID),
Type varchar(255) CHECK (Type IN('Load', 'Unload')),
Pallets int,
SapPallets int,
Deleted bit DEFAULT 0);

INSERT Operations (SapFolio, Type, Pallets, SapPallets) 
VALUES('FY35FH6', 'Load', 30, 30);

DROP TABLE Events;
CREATE TABLE Events (
EventID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
TrackVisitID uniqueidentifier FOREIGN KEY REFERENCES TrackVisits(TrackVisitID),
CreationDate datetime,
AITime datetime,
CaudalTime datetime,
SapFolio varchar(255),
EventName varchar(255) NOT NULL 
CHECK (EventName IN('OnPlantEnter', 'OnPlantExit', 'OnCheckPoint', 'OnBoxEnter', 'OnBoxExit','OnLock', 'OnUnlock', 'OnPalletLoaded', 'OnPalletUnloaded', 'OnCameraError')),
Plate varchar(255),
IsBox bit,
CameraFile varchar(255),
Pallets int,
Deleted bit DEFAULT 0,
UUID uniqueidentifier,
Shift int,
CameraID uniqueidentifier FOREIGN KEY REFERENCES Cameras(CameraID) NOT NULL);

CREATE INDEX aiIndex ON Events (AITime), SapOrder, EventName, Plate)
CREATE INDEX sapIndex ON Events (SapFolio)
CREATE INDEX nameIndex ON Events (EventName)
CREATE INDEX plateIndex ON Events (Plate)

EXECUTE sp_helpindex events

SELECT * FROM Events
EXEC sp_RENAME 'Events.SapOrder' , 'SapFolio', 'COLUMN'
ALTER TABLE Events ADD UUID uniqueidentifier


INSERT Events (TrackVisitID, CreationDate, AITime, 
CaudalTime, SapOrder, EventName, Plate, IsBox, CameraFile, Pallets, CameraID) 
VALUES('EB3C6647-3672-4C92-9027-058934D61811', CURRENT_TIMESTAMP, '20180814 10:34:09 AM', 
'20180814 10:34:09 AM', 'FY35FH6', 'OnPlantEnter', 'WFY-152', 0, 'wfuy372vw623', 34, '86C7880F-896B-42C7-B357-8BBB5F87FC42');

DROP TABLE Alerts;
CREATE TABLE Alerts (
AlertID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
AlertName varchar(255),
NotificationChannel varchar(255),
Deleted bit DEFAULT 0,
PlantID uniqueidentifier FOREIGN KEY REFERENCES Plants(PlantID) NOT NULL);

INSERT Alerts (AlertName, NotificationChannel, PlantID) 
VALUES('Inconsistencia de pallets', 'correo electrónico', '17EF311F-5728-4C45-999E-049B1A5177C9');

DROP TABLE Conditions;
CREATE TABLE Conditions (
ConditionID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
AlertID uniqueidentifier FOREIGN KEY REFERENCES Alerts(AlertID) NOT NULL,
Field varchar(255),
Operator varchar(255),
Value varchar(255),
Deleted bit DEFAULT 0);

INSERT Conditions (AlertID, Field, Operator, Value) 
VALUES('D0B1B0DE-9709-4BDA-BB51-7DD99ED58EE2', 'plate', '=', 'WFY-152');

DROP TABLE AlertsUsers;
CREATE TABLE AlertsUsers (
AlertID uniqueidentifier FOREIGN KEY REFERENCES Alerts(AlertID) NOT NULL,
UserID uniqueidentifier FOREIGN KEY REFERENCES Users(UserID) NOT NULL,
Deleted bit DEFAULT 0,
CONSTRAINT PK_AlertsUsers PRIMARY KEY (AlertID, UserID));

INSERT AlertsUsers (AlertID, UserID) 
VALUES('D0B1B0DE-9709-4BDA-BB51-7DD99ED58EE2', 'BE910512-A7E4-4D96-8155-201D4693B39C');

DROP TABLE CurrentTracks;
CREATE TABLE CurrentTracks (
TrackID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
Plate varchar(255),
OnEnterTime datetime,
MeetingTime datetime,
ParkingTime datetime,
OnStartTime datetime,
OnExitTime datetime,
Folio1 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Folio2 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Folio3 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Folio4 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Folio5 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Shift int);

INSERT CurrentTracks (Plate, OnEnterTime, MeetingTime, ParkingTime, OnStartTime, Folio1, Folio2)
VALUES ('MVW3453', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FY35FH6', 'FY35FH6');

DROP TABLE TrackLog;
CREATE TABLE TrackLog (
TrackID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
Plate varchar(255),
OnEnterTime datetime,
MeetingTime datetime,
ParkingTime datetime,
OnStartTime datetime,
OnExitTime datetime,
Folio1 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Folio2 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Folio3 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Folio4 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Folio5 varchar(255) FOREIGN KEY REFERENCES Operations(SapFolio),
Shift int,
Deleted bit DEFAULT 0,
Date datetime);

INSERT TrackLog (Plate, OnEnterTime, MeetingTime, ParkingTime, OnStartTime, Folio1, Folio2, Date)
VALUES ('MVW3453', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'FY35FH6', 'FY35FH6', CURRENT_TIMESTAMP);

DROP TABLE TrackPlaces;
CREATE TABLE TrackPlaces (
TrackPlacesID uniqueidentifier NOT NULL DEFAULT newid() PRIMARY KEY,
PlaceID uniqueidentifier FOREIGN KEY REFERENCES Places(PlaceID),
CurrentTrackID uniqueidentifier FOREIGN KEY REFERENCES CurrentTracks(TrackID),
TrackLogID uniqueidentifier FOREIGN KEY REFERENCES TrackLog(TrackID),
Time datetime,
Deleted bit DEFAULT 0);

INSERT TrackPlaces (PlaceID, CurrentTrackID, Time)
VALUES ('77C70969-C084-4AF8-A28E-B3E2345AECCE', 'EF879B4F-70E7-440F-BDA4-CD9B5224C91F', CURRENT_TIMESTAMP);
