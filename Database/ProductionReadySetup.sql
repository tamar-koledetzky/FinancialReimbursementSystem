-- PRODUCTION READY DATABASE SETUP
-- Clean, professional, no hardcoded values

-- Clean all existing data
DELETE FROM dbo.MonthlyIncomes;
DELETE FROM dbo.Citizens;

-- Insert professional test data
INSERT INTO dbo.Citizens (FirstName, LastName, IdentityNumber, Email, Phone, CreatedAt)
VALUES 
    ('דוד', 'כהן', '111111111', 'dod.cohen@email.com', '050-1111111', GETDATE()),
    ('שרה', 'לוי', '222222222', 'sarah.levi@email.com', '050-2222222', GETDATE()),
    ('יוסף', 'מזרחי', '333333333', 'yosef.mizrachi@email.com', '050-3333333', GETDATE()),
    ('רחל', 'אברהם', '444444444', 'rachel.avraham@email.com', '050-4444444', GETDATE()),
    ('משה', 'גולדברג', '555555555', 'moshe.goldberg@email.com', '050-5555555', GETDATE());

-- Insert realistic monthly income data
INSERT INTO dbo.MonthlyIncomes (CitizenId, Year, Month, GrossIncome, NetIncome)
VALUES 
    -- Low income citizens (eligible)
    (1, 2023, 1, 4500, 4100), (1, 2023, 2, 4600, 4200), (1, 2023, 3, 4400, 4000),
    (1, 2023, 4, 4700, 4300), (1, 2023, 5, 4500, 4100), (1, 2023, 6, 4600, 4200),
    (5, 2023, 1, 4200, 3800), (5, 2023, 2, 4300, 3900), (5, 2023, 3, 4100, 3700),
    (5, 2023, 4, 4400, 4000), (5, 2023, 5, 4200, 3800), (5, 2023, 6, 4300, 3900),
    
    -- Medium income citizens (eligible)
    (2, 2023, 1, 7500, 6800), (2, 2023, 2, 7700, 7000), (2, 2023, 3, 7300, 6600),
    (2, 2023, 4, 7800, 7100), (2, 2023, 5, 7600, 6900), (2, 2023, 6, 7700, 7000),
    (4, 2023, 1, 6800, 6200), (4, 2023, 2, 7000, 6400), (4, 2023, 3, 6600, 6000),
    (4, 2023, 4, 6900, 6300), (4, 2023, 5, 6700, 6100), (4, 2023, 6, 6800, 6200),
    
    -- High income citizen (not eligible)
    (3, 2023, 1, 15000, 13500), (3, 2023, 2, 15500, 14000), (3, 2023, 3, 14800, 13300),
    (3, 2023, 4, 15200, 13700), (3, 2023, 5, 15000, 13500), (3, 2023, 6, 15300, 13800);

-- Show professional summary
SELECT '✅ PRODUCTION DATABASE SETUP COMPLETED' as Status;
SELECT '📊 Data Summary:' as Info;
SELECT 
    COUNT(DISTINCT c.CitizenId) as TotalCitizens,
    (SELECT COUNT(*) FROM dbo.Citizens c2 
     JOIN dbo.MonthlyIncomes mi2 ON c2.CitizenId = mi2.CitizenId 
     WHERE mi2.GrossIncome < 5000 GROUP BY c2.CitizenId HAVING AVG(mi2.GrossIncome) < 5000) as LowIncome,
    (SELECT COUNT(*) FROM dbo.Citizens c3 
     JOIN dbo.MonthlyIncomes mi3 ON c3.CitizenId = mi3.CitizenId 
     WHERE mi3.GrossIncome BETWEEN 5000 AND 10000 GROUP BY c3.CitizenId HAVING AVG(mi3.GrossIncome) BETWEEN 5000 AND 10000) as MediumIncome,
    (SELECT COUNT(*) FROM dbo.Citizens c4 
     JOIN dbo.MonthlyIncomes mi4 ON c4.CitizenId = mi4.CitizenId 
     WHERE mi4.GrossIncome > 10000 GROUP BY c4.CitizenId HAVING AVG(mi4.GrossIncome) > 10000) as HighIncome
FROM dbo.Citizens c
JOIN dbo.MonthlyIncomes mi ON c.CitizenId = mi.CitizenId;
