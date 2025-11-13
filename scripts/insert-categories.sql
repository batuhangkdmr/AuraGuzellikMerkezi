-- NEW HOLLAND YEDEK PARÇA Kategorileri Toplu Ekleme
-- Tüm kategoriler için aynı görsel kullanılacak
DECLARE @ImageUrl NVARCHAR(500) = 'https://res.cloudinary.com/dkmmkfbjv/image/upload/v1763066681/auraguzellikmerkezi/categories/noksqiygt1uei96seqwc.jpg';
DECLARE @MainCategoryId INT;

-- Ana kategori zaten var mı kontrol et, yoksa ekle
IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 1)
BEGIN
    INSERT INTO categories (id, name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES (1, 'NEW HOLLAND YEDEK PARÇA', 'new-holland-yedek-parca', NULL, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

SET @MainCategoryId = 1;

-- Alt Kategoriler (Sub Categories) - parent_id = 1
-- FİAT 54C SERİSİ
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fiat-54c-serisi')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('FİAT 54C SERİSİ', 'fiat-54c-serisi', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TT JUNIOR SERİSİ (2013-)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tt-junior-serisi-2013')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TT JUNIOR SERİSİ (2013-)', 'tt-junior-serisi-2013', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TT&TT BAHÇE SERİLERİ (-2010)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tt-tt-bahce-serileri-2010')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TT&TT BAHÇE SERİLERİ (-2010)', 'tt-tt-bahce-serileri-2010', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- FİAT 480&640 SERİSİ
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fiat-480-640-serisi')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('FİAT 480&640 SERİSİ', 'fiat-480-640-serisi', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- FİAT 46&56 SERİSİ (-2010)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fiat-46-56-serisi-2010')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('FİAT 46&56 SERİSİ (-2010)', 'fiat-46-56-serisi-2010', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- 56 SERİSİ MAVİ (2007-)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = '56-serisi-mavi-2007')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('56 SERİSİ MAVİ (2007-)', '56-serisi-mavi-2007', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TD&TD BAHÇE SERİSİ (-2011)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'td-td-bahce-serisi-2011')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TD&TD BAHÇE SERİSİ (-2011)', 'td-td-bahce-serisi-2011', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TD5000B SERİSİ (-2011)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'td5000b-serisi-2011')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TD5000B SERİSİ (-2011)', 'td5000b-serisi-2011', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TT&TT BAHÇE SERİLERİ (2011-)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tt-tt-bahce-serileri-2011')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TT&TT BAHÇE SERİLERİ (2011-)', 'tt-tt-bahce-serileri-2011', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TD5000B SERİSİ (2011-)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'td5000b-serisi-2011-plus')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TD5000B SERİSİ (2011-)', 'td5000b-serisi-2011-plus', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TDD SERİSİ (2011-2013)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tdd-serisi-2011-2013')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TDD SERİSİ (2011-2013)', 'tdd-serisi-2011-2013', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TD BLUEMASTER SERİES (2013-)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'td-bluemaster-series-2013')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TD BLUEMASTER SERİES (2013-)', 'td-bluemaster-series-2013', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- T480-T580 SERİSİ (2011-2014)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 't480-t580-serisi-2011-2014')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('T480-T580 SERİSİ (2011-2014)', 't480-t580-serisi-2011-2014', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- T480S SERİSİ - T580B SERİSİ (2014-)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 't480s-serisi-t580b-serisi-2014')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('T480S SERİSİ - T580B SERİSİ (2014-)', 't480s-serisi-t580b-serisi-2014', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TD4.&TD BAHÇE SERİSİ (2014-)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'td4-td-bahce-serisi-2014')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TD4.&TD BAHÇE SERİSİ (2014-)', 'td4-td-bahce-serisi-2014', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TT4 TARLA SERİSİ (2016-)
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tt4-tarla-serisi-2016')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TT4 TARLA SERİSİ (2016-)', 'tt4-tarla-serisi-2016', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- TN-TNNA-TNVA-TNDA-TLA SERİ
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'tn-tnna-tnva-tnda-tla-seri')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('TN-TNNA-TNVA-TNDA-TLA SERİ', 'tn-tnna-tnva-tnda-tla-seri', @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
END

-- Child Kategoriler (Child Categories) - Ortak alt kategoriler
-- Bu kategoriler her alt kategoriye eklenebilir
-- Önce child kategorileri oluştur, sonra her alt kategoriye bağla

DECLARE @ChildCategories TABLE (
    name NVARCHAR(255),
    slug NVARCHAR(255)
);

INSERT INTO @ChildCategories (name, slug) VALUES
('Motor Aksamı', 'motor-aksami'),
('Ön Düzen & Arka Düzen', 'on-duzen-arka-duzen'),
('Yakıt Aksamı', 'yakit-aksami'),
('Debriyaj & Şanzuman Aksamı', 'debriyaj-sanzuman-aksami'),
('Fren & Diferansiyel Aksamı', 'fren-diferansiyel-aksami'),
('Elektrik Aksamı', 'elektrik-aksami'),
('Hidrolik & Çeki Aksamı', 'hidrolik-ceki-aksami'),
('Kabin & Kaporta Aksamı', 'kabin-kaporta-aksami'),
('Kaporta & Kabin Aksamı', 'kaporta-kabin-aksami'),
('Elektrik & Kaporta Aksamı', 'elektrik-kaporta-aksami'),
('Debriyaj Aksamı', 'debriyaj-aksami');

-- Child kategorileri ekle (eğer yoksa)
DECLARE @ChildName NVARCHAR(255);
DECLARE @ChildSlug NVARCHAR(255);
DECLARE child_cursor CURSOR FOR SELECT name, slug FROM @ChildCategories;
OPEN child_cursor;
FETCH NEXT FROM child_cursor INTO @ChildName, @ChildSlug;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = @ChildSlug)
    BEGIN
        -- Child kategorileri önce parent_id olmadan ekle (sonra alt kategorilere bağlanacak)
        -- Bu kategoriler geçici olarak ana kategoriye bağlı olacak, sonra düzenlenecek
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES (@ChildName, @ChildSlug, @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    FETCH NEXT FROM child_cursor INTO @ChildName, @ChildSlug;
END
CLOSE child_cursor;
DEALLOCATE child_cursor;

-- Şimdi her alt kategoriye child kategorileri bağla
-- FİAT 54C SERİSİ için child kategoriler
DECLARE @Fiat54CId INT = (SELECT id FROM categories WHERE slug = 'fiat-54c-serisi');
IF @Fiat54CId IS NOT NULL
BEGIN
    -- Motor Aksamı
    IF EXISTS (SELECT 1 FROM categories WHERE slug = 'motor-aksami' AND parent_id = @MainCategoryId)
    BEGIN
        UPDATE categories SET parent_id = @Fiat54CId WHERE slug = 'motor-aksami' AND parent_id = @MainCategoryId;
    END
    ELSE IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'motor-aksami' AND parent_id = @Fiat54CId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Motor Aksamı', 'motor-aksami', @Fiat54CId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Ön Düzen & Arka Düzen
    IF EXISTS (SELECT 1 FROM categories WHERE slug = 'on-duzen-arka-duzen' AND parent_id = @MainCategoryId)
    BEGIN
        UPDATE categories SET parent_id = @Fiat54CId WHERE slug = 'on-duzen-arka-duzen' AND parent_id = @MainCategoryId;
    END
    ELSE IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'on-duzen-arka-duzen' AND parent_id = @Fiat54CId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Ön Düzen & Arka Düzen', 'on-duzen-arka-duzen', @Fiat54CId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Yakıt Aksamı
    IF EXISTS (SELECT 1 FROM categories WHERE slug = 'yakit-aksami' AND parent_id = @MainCategoryId)
    BEGIN
        UPDATE categories SET parent_id = @Fiat54CId WHERE slug = 'yakit-aksami' AND parent_id = @MainCategoryId;
    END
    ELSE IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'yakit-aksami' AND parent_id = @Fiat54CId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Yakıt Aksamı', 'yakit-aksami', @Fiat54CId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Debriyaj & Şanzuman Aksamı
    IF EXISTS (SELECT 1 FROM categories WHERE slug = 'debriyaj-sanzuman-aksami' AND parent_id = @MainCategoryId)
    BEGIN
        UPDATE categories SET parent_id = @Fiat54CId WHERE slug = 'debriyaj-sanzuman-aksami' AND parent_id = @MainCategoryId;
    END
    ELSE IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'debriyaj-sanzuman-aksami' AND parent_id = @Fiat54CId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Debriyaj & Şanzuman Aksamı', 'debriyaj-sanzuman-aksami', @Fiat54CId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Fren & Diferansiyel Aksamı
    IF EXISTS (SELECT 1 FROM categories WHERE slug = 'fren-diferansiyel-aksami' AND parent_id = @MainCategoryId)
    BEGIN
        UPDATE categories SET parent_id = @Fiat54CId WHERE slug = 'fren-diferansiyel-aksami' AND parent_id = @MainCategoryId;
    END
    ELSE IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fren-diferansiyel-aksami' AND parent_id = @Fiat54CId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Fren & Diferansiyel Aksamı', 'fren-diferansiyel-aksami', @Fiat54CId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Elektrik Aksamı
    IF EXISTS (SELECT 1 FROM categories WHERE slug = 'elektrik-aksami' AND parent_id = @MainCategoryId)
    BEGIN
        UPDATE categories SET parent_id = @Fiat54CId WHERE slug = 'elektrik-aksami' AND parent_id = @MainCategoryId;
    END
    ELSE IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'elektrik-aksami' AND parent_id = @Fiat54CId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Elektrik Aksamı', 'elektrik-aksami', @Fiat54CId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Hidrolik & Çeki Aksamı
    IF EXISTS (SELECT 1 FROM categories WHERE slug = 'hidrolik-ceki-aksami' AND parent_id = @MainCategoryId)
    BEGIN
        UPDATE categories SET parent_id = @Fiat54CId WHERE slug = 'hidrolik-ceki-aksami' AND parent_id = @MainCategoryId;
    END
    ELSE IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'hidrolik-ceki-aksami' AND parent_id = @Fiat54CId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Hidrolik & Çeki Aksamı', 'hidrolik-ceki-aksami', @Fiat54CId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Kabin & Kaporta Aksamı
    IF EXISTS (SELECT 1 FROM categories WHERE slug = 'kabin-kaporta-aksami' AND parent_id = @MainCategoryId)
    BEGIN
        UPDATE categories SET parent_id = @Fiat54CId WHERE slug = 'kabin-kaporta-aksami' AND parent_id = @MainCategoryId;
    END
    ELSE IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'kabin-kaporta-aksami' AND parent_id = @Fiat54CId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Kabin & Kaporta Aksamı', 'kabin-kaporta-aksami', @Fiat54CId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
END

-- TT JUNIOR SERİSİ (2013-) için child kategoriler
DECLARE @TTJuniorId INT = (SELECT id FROM categories WHERE slug = 'tt-junior-serisi-2013');
IF @TTJuniorId IS NOT NULL
BEGIN
    -- Motor Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'motor-aksami' AND parent_id = @TTJuniorId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Motor Aksamı', 'motor-aksami-tt-junior', @TTJuniorId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Ön Düzen & Arka Düzen
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'on-duzen-arka-duzen' AND parent_id = @TTJuniorId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Ön Düzen & Arka Düzen', 'on-duzen-arka-duzen-tt-junior', @TTJuniorId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Yakıt Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'yakit-aksami' AND parent_id = @TTJuniorId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Yakıt Aksamı', 'yakit-aksami-tt-junior', @TTJuniorId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Debriyaj & Şanzuman Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'debriyaj-sanzuman-aksami' AND parent_id = @TTJuniorId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Debriyaj & Şanzuman Aksamı', 'debriyaj-sanzuman-aksami-tt-junior', @TTJuniorId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Fren & Diferansiyel Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fren-diferansiyel-aksami' AND parent_id = @TTJuniorId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Fren & Diferansiyel Aksamı', 'fren-diferansiyel-aksami-tt-junior', @TTJuniorId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Elektrik Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'elektrik-aksami' AND parent_id = @TTJuniorId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Elektrik Aksamı', 'elektrik-aksami-tt-junior', @TTJuniorId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Hidrolik & Çeki Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'hidrolik-ceki-aksami' AND parent_id = @TTJuniorId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Hidrolik & Çeki Aksamı', 'hidrolik-ceki-aksami-tt-junior', @TTJuniorId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Kaporta & Kabin Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'kaporta-kabin-aksami' AND parent_id = @TTJuniorId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Kaporta & Kabin Aksamı', 'kaporta-kabin-aksami-tt-junior', @TTJuniorId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
END

-- Diğer alt kategoriler için de aynı child kategorileri ekle
-- Her alt kategori için aynı child kategorileri ekleyen bir fonksiyon oluşturalım
-- Bu daha temiz ve bakımı kolay olacak

-- Kalan alt kategoriler için child kategorileri ekle
DECLARE @SubCategorySlugs TABLE (slug NVARCHAR(255));
INSERT INTO @SubCategorySlugs VALUES
('tt-tt-bahce-serileri-2010'),
('fiat-480-640-serisi'),
('fiat-46-56-serisi-2010'),
('56-serisi-mavi-2007'),
('td-td-bahce-serisi-2011'),
('td5000b-serisi-2011'),
('tt-tt-bahce-serileri-2011'),
('td5000b-serisi-2011-plus'),
('tdd-serisi-2011-2013'),
('td-bluemaster-series-2013'),
('t480-t580-serisi-2011-2014'),
('t480s-serisi-t580b-serisi-2014'),
('td4-td-bahce-serisi-2014'),
('tt4-tarla-serisi-2016'),
('tn-tnna-tnva-tnda-tla-seri');

-- Her alt kategori için standart child kategorileri ekle
DECLARE @SubSlug NVARCHAR(255);
DECLARE @SubId INT;
DECLARE sub_cursor CURSOR FOR SELECT slug FROM @SubCategorySlugs;
OPEN sub_cursor;
FETCH NEXT FROM sub_cursor INTO @SubSlug;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SubId = (SELECT id FROM categories WHERE slug = @SubSlug);
    
    IF @SubId IS NOT NULL
    BEGIN
        -- Motor Aksamı
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = CONCAT('motor-aksami-', @SubSlug) AND parent_id = @SubId)
        BEGIN
            INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
            VALUES ('Motor Aksamı', CONCAT('motor-aksami-', @SubSlug), @SubId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
        END
        
        -- Ön Düzen & Arka Düzen
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = CONCAT('on-duzen-arka-duzen-', @SubSlug) AND parent_id = @SubId)
        BEGIN
            INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
            VALUES ('Ön Düzen & Arka Düzen', CONCAT('on-duzen-arka-duzen-', @SubSlug), @SubId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
        END
        
        -- Yakıt Aksamı
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = CONCAT('yakit-aksami-', @SubSlug) AND parent_id = @SubId)
        BEGIN
            INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
            VALUES ('Yakıt Aksamı', CONCAT('yakit-aksami-', @SubSlug), @SubId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
        END
        
        -- Debriyaj & Şanzuman Aksamı
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = CONCAT('debriyaj-sanzuman-aksami-', @SubSlug) AND parent_id = @SubId)
        BEGIN
            INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
            VALUES ('Debriyaj & Şanzuman Aksamı', CONCAT('debriyaj-sanzuman-aksami-', @SubSlug), @SubId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
        END
        
        -- Fren & Diferansiyel Aksamı
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = CONCAT('fren-diferansiyel-aksami-', @SubSlug) AND parent_id = @SubId)
        BEGIN
            INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
            VALUES ('Fren & Diferansiyel Aksamı', CONCAT('fren-diferansiyel-aksami-', @SubSlug), @SubId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
        END
        
        -- Elektrik Aksamı
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = CONCAT('elektrik-aksami-', @SubSlug) AND parent_id = @SubId)
        BEGIN
            INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
            VALUES ('Elektrik Aksamı', CONCAT('elektrik-aksami-', @SubSlug), @SubId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
        END
        
        -- Hidrolik & Çeki Aksamı
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = CONCAT('hidrolik-ceki-aksami-', @SubSlug) AND parent_id = @SubId)
        BEGIN
            INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
            VALUES ('Hidrolik & Çeki Aksamı', CONCAT('hidrolik-ceki-aksami-', @SubSlug), @SubId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
        END
        
        -- Kabin & Kaporta Aksamı veya Kaporta & Kabin Aksamı (her ikisi de olabilir)
        IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = CONCAT('kabin-kaporta-aksami-', @SubSlug) AND parent_id = @SubId)
        AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = CONCAT('kaporta-kabin-aksami-', @SubSlug) AND parent_id = @SubId)
        BEGIN
            INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
            VALUES ('Kabin & Kaporta Aksamı', CONCAT('kabin-kaporta-aksami-', @SubSlug), @SubId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
        END
    END
    
    FETCH NEXT FROM sub_cursor INTO @SubSlug;
END
CLOSE sub_cursor;
DEALLOCATE sub_cursor;

PRINT 'Kategoriler başarıyla eklendi!';

