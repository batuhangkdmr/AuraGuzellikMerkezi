-- NEW HOLLAND YEDEK PARÇA Kategorileri Toplu Ekleme
-- Tüm kategoriler için aynı görsel kullanılacak
DECLARE @ImageUrl NVARCHAR(500) = 'https://res.cloudinary.com/dkmmkfbjv/image/upload/v1763066681/auraguzellikmerkezi/categories/noksqiygt1uei96seqwc.jpg';
DECLARE @MainCategoryId INT;

-- Ana kategori zaten var mı kontrol et, yoksa ekle
IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'new-holland-yedek-parca')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('NEW HOLLAND YEDEK PARÇA', 'new-holland-yedek-parca', NULL, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    SET @MainCategoryId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SET @MainCategoryId = (SELECT id FROM categories WHERE slug = 'new-holland-yedek-parca');
END

-- Alt Kategoriler (Sub Categories) - parent_id = @MainCategoryId
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

-- Child Kategoriler - Her alt kategoriye eklenen ortak kategoriler
-- Helper function: Bir alt kategoriye child kategorileri ekle
DECLARE @SubCategorySlug NVARCHAR(255);
DECLARE @SubCategoryId INT;

-- FİAT 54C SERİSİ için child kategoriler
SET @SubCategorySlug = 'fiat-54c-serisi';
SET @SubCategoryId = (SELECT id FROM categories WHERE slug = @SubCategorySlug);
IF @SubCategoryId IS NOT NULL
BEGIN
    -- Motor Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'motor-aksami-fiat-54c' AND parent_id = @SubCategoryId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Motor Aksamı', 'motor-aksami-fiat-54c', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Ön Düzen & Arka Düzen
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'on-duzen-arka-duzen-fiat-54c' AND parent_id = @SubCategoryId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Ön Düzen & Arka Düzen', 'on-duzen-arka-duzen-fiat-54c', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Yakıt Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'yakit-aksami-fiat-54c' AND parent_id = @SubCategoryId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Yakıt Aksamı', 'yakit-aksami-fiat-54c', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Debriyaj & Şanzuman Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'debriyaj-sanzuman-aksami-fiat-54c' AND parent_id = @SubCategoryId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Debriyaj & Şanzuman Aksamı', 'debriyaj-sanzuman-aksami-fiat-54c', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Fren & Diferansiyel Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fren-diferansiyel-aksami-fiat-54c' AND parent_id = @SubCategoryId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Fren & Diferansiyel Aksamı', 'fren-diferansiyel-aksami-fiat-54c', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Elektrik Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'elektrik-aksami-fiat-54c' AND parent_id = @SubCategoryId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Elektrik Aksamı', 'elektrik-aksami-fiat-54c', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Hidrolik & Çeki Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'hidrolik-ceki-aksami-fiat-54c' AND parent_id = @SubCategoryId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Hidrolik & Çeki Aksamı', 'hidrolik-ceki-aksami-fiat-54c', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    
    -- Kabin & Kaporta Aksamı
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'kabin-kaporta-aksami-fiat-54c' AND parent_id = @SubCategoryId)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES ('Kabin & Kaporta Aksamı', 'kabin-kaporta-aksami-fiat-54c', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
END

-- TT JUNIOR SERİSİ (2013-) için child kategoriler
SET @SubCategorySlug = 'tt-junior-serisi-2013';
SET @SubCategoryId = (SELECT id FROM categories WHERE slug = @SubCategorySlug);
IF @SubCategoryId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'motor-aksami-tt-junior' AND parent_id = @SubCategoryId)
    BEGIN INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at) VALUES ('Motor Aksamı', 'motor-aksami-tt-junior', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE()); END
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'on-duzen-arka-duzen-tt-junior' AND parent_id = @SubCategoryId)
    BEGIN INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at) VALUES ('Ön Düzen & Arka Düzen', 'on-duzen-arka-duzen-tt-junior', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE()); END
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'yakit-aksami-tt-junior' AND parent_id = @SubCategoryId)
    BEGIN INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at) VALUES ('Yakıt Aksamı', 'yakit-aksami-tt-junior', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE()); END
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'debriyaj-sanzuman-aksami-tt-junior' AND parent_id = @SubCategoryId)
    BEGIN INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at) VALUES ('Debriyaj & Şanzuman Aksamı', 'debriyaj-sanzuman-aksami-tt-junior', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE()); END
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fren-diferansiyel-aksami-tt-junior' AND parent_id = @SubCategoryId)
    BEGIN INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at) VALUES ('Fren & Diferansiyel Aksamı', 'fren-diferansiyel-aksami-tt-junior', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE()); END
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'elektrik-aksami-tt-junior' AND parent_id = @SubCategoryId)
    BEGIN INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at) VALUES ('Elektrik Aksamı', 'elektrik-aksami-tt-junior', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE()); END
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'hidrolik-ceki-aksami-tt-junior' AND parent_id = @SubCategoryId)
    BEGIN INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at) VALUES ('Hidrolik & Çeki Aksamı', 'hidrolik-ceki-aksami-tt-junior', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE()); END
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'kaporta-kabin-aksami-tt-junior' AND parent_id = @SubCategoryId)
    BEGIN INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at) VALUES ('Kaporta & Kabin Aksamı', 'kaporta-kabin-aksami-tt-junior', @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE()); END
END

-- Diğer tüm alt kategoriler için standart child kategorileri ekle
-- Her alt kategori için aynı child kategorileri ekleyen bir döngü
DECLARE @AllSubCategories TABLE (slug NVARCHAR(255));
INSERT INTO @AllSubCategories VALUES
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

-- Standart child kategoriler
DECLARE @StandardChildren TABLE (name NVARCHAR(255), slug NVARCHAR(255));
INSERT INTO @StandardChildren VALUES
('Motor Aksamı', 'motor-aksami'),
('Ön Düzen & Arka Düzen', 'on-duzen-arka-duzen'),
('Yakıt Aksamı', 'yakit-aksami'),
('Debriyaj & Şanzuman Aksamı', 'debriyaj-sanzuman-aksami'),
('Fren & Diferansiyel Aksamı', 'fren-diferansiyel-aksami'),
('Elektrik Aksamı', 'elektrik-aksami'),
('Hidrolik & Çeki Aksamı', 'hidrolik-ceki-aksami'),
('Kabin & Kaporta Aksamı', 'kabin-kaporta-aksami'),
('Kaporta & Kabin Aksamı', 'kaporta-kabin-aksami');

-- Her alt kategori için child kategorileri ekle
DECLARE sub_cursor CURSOR FOR SELECT slug FROM @AllSubCategories;
OPEN sub_cursor;
FETCH NEXT FROM sub_cursor INTO @SubCategorySlug;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SubCategoryId = (SELECT id FROM categories WHERE slug = @SubCategorySlug);
    
    IF @SubCategoryId IS NOT NULL
    BEGIN
        DECLARE @ChildName NVARCHAR(255);
        DECLARE @ChildSlug NVARCHAR(255);
        DECLARE child_cursor CURSOR FOR SELECT name, slug FROM @StandardChildren;
        OPEN child_cursor;
        FETCH NEXT FROM child_cursor INTO @ChildName, @ChildSlug;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            DECLARE @UniqueSlug NVARCHAR(255) = CONCAT(@ChildSlug, '-', REPLACE(@SubCategorySlug, '-', '-'));
            
            -- Slug çok uzun olabilir, kısaltalım
            IF LEN(@UniqueSlug) > 200
            BEGIN
                SET @UniqueSlug = CONCAT(@ChildSlug, '-', SUBSTRING(@SubCategorySlug, 1, 50));
            END
            
            IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = @UniqueSlug AND parent_id = @SubCategoryId)
            BEGIN
                INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
                VALUES (@ChildName, @UniqueSlug, @SubCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
            END
            
            FETCH NEXT FROM child_cursor INTO @ChildName, @ChildSlug;
        END
        CLOSE child_cursor;
        DEALLOCATE child_cursor;
    END
    
    FETCH NEXT FROM sub_cursor INTO @SubCategorySlug;
END
CLOSE sub_cursor;
DEALLOCATE sub_cursor;

PRINT 'Tüm kategoriler başarıyla eklendi!';
PRINT CONCAT('Ana kategori ID: ', @MainCategoryId);

