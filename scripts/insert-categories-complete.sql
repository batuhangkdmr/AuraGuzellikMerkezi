-- NEW HOLLAND YEDEK PARÇA Kategorileri Toplu Ekleme
-- Tüm kategoriler için aynı görsel kullanılacak
DECLARE @ImageUrl NVARCHAR(500) = 'https://res.cloudinary.com/dkmmkfbjv/image/upload/v1763066681/auraguzellikmerkezi/categories/noksqiygt1uei96seqwc.jpg';
DECLARE @MainCategoryId INT;

-- Ana kategori zaten var mı kontrol et, yoksa ekle
IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 1 OR slug = 'new-holland-yedek-parca')
BEGIN
    INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
    VALUES ('NEW HOLLAND YEDEK PARÇA', 'new-holland-yedek-parca', NULL, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    SET @MainCategoryId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SET @MainCategoryId = (SELECT id FROM categories WHERE id = 1 OR slug = 'new-holland-yedek-parca');
END

-- Alt Kategoriler (Sub Categories) - parent_id = @MainCategoryId
DECLARE @SubCategories TABLE (
    name NVARCHAR(255),
    slug NVARCHAR(255)
);

INSERT INTO @SubCategories (name, slug) VALUES
('FİAT 54C SERİSİ', 'fiat-54c-serisi'),
('TT JUNIOR SERİSİ (2013-)', 'tt-junior-serisi-2013'),
('TT&TT BAHÇE SERİLERİ (-2010)', 'tt-tt-bahce-serileri-2010'),
('FİAT 480&640 SERİSİ', 'fiat-480-640-serisi'),
('FİAT 46&56 SERİSİ (-2010)', 'fiat-46-56-serisi-2010'),
('56 SERİSİ MAVİ (2007-)', '56-serisi-mavi-2007'),
('TD&TD BAHÇE SERİSİ (-2011)', 'td-td-bahce-serisi-2011'),
('TD5000B SERİSİ (-2011)', 'td5000b-serisi-2011'),
('TT&TT BAHÇE SERİLERİ (2011-)', 'tt-tt-bahce-serileri-2011'),
('TD5000B SERİSİ (2011-)', 'td5000b-serisi-2011-plus'),
('TDD SERİSİ (2011-2013)', 'tdd-serisi-2011-2013'),
('TD BLUEMASTER SERİES (2013-)', 'td-bluemaster-series-2013'),
('T480-T580 SERİSİ (2011-2014)', 't480-t580-serisi-2011-2014'),
('T480S SERİSİ - T580B SERİSİ (2014-)', 't480s-serisi-t580b-serisi-2014'),
('TD4.&TD BAHÇE SERİSİ (2014-)', 'td4-td-bahce-serisi-2014'),
('TT4 TARLA SERİSİ (2016-)', 'tt4-tarla-serisi-2016'),
('TN-TNNA-TNVA-TNDA-TLA SERİ', 'tn-tnna-tnva-tnda-tla-seri');

-- Alt kategorileri ekle
DECLARE @SubName NVARCHAR(255);
DECLARE @SubSlug NVARCHAR(255);
DECLARE @SubId INT;
DECLARE sub_cursor CURSOR FOR SELECT name, slug FROM @SubCategories;
OPEN sub_cursor;
FETCH NEXT FROM sub_cursor INTO @SubName, @SubSlug;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = @SubSlug)
    BEGIN
        INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
        VALUES (@SubName, @SubSlug, @MainCategoryId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
    END
    FETCH NEXT FROM sub_cursor INTO @SubName, @SubSlug;
END
CLOSE sub_cursor;
DEALLOCATE sub_cursor;

-- Child Kategoriler - Her alt kategoriye eklenen ortak kategoriler
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

-- Her alt kategori için child kategorileri ekle
DECLARE sub_cursor2 CURSOR FOR SELECT slug FROM @SubCategories;
OPEN sub_cursor2;
FETCH NEXT FROM sub_cursor2 INTO @SubSlug;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SubId = (SELECT id FROM categories WHERE slug = @SubSlug AND parent_id = @MainCategoryId);
    
    IF @SubId IS NOT NULL
    BEGIN
        DECLARE @ChildName NVARCHAR(255);
        DECLARE @ChildSlug NVARCHAR(255);
        DECLARE child_cursor CURSOR FOR SELECT name, slug FROM @ChildCategories;
        OPEN child_cursor;
        FETCH NEXT FROM child_cursor INTO @ChildName, @ChildSlug;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Her alt kategori için unique slug oluştur
            DECLARE @UniqueChildSlug NVARCHAR(255) = CONCAT(@ChildSlug, '-', @SubSlug);
            
            IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = @UniqueChildSlug AND parent_id = @SubId)
            BEGIN
                INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
                VALUES (@ChildName, @UniqueChildSlug, @SubId, @ImageUrl, 0, 1, GETDATE(), GETDATE());
            END
            
            FETCH NEXT FROM child_cursor INTO @ChildName, @ChildSlug;
        END
        CLOSE child_cursor;
        DEALLOCATE child_cursor;
    END
    
    FETCH NEXT FROM sub_cursor2 INTO @SubSlug;
END
CLOSE sub_cursor2;
DEALLOCATE sub_cursor2;

PRINT 'Tüm kategoriler başarıyla eklendi!';
PRINT CONCAT('Ana kategori ID: ', @MainCategoryId);
PRINT 'Alt kategoriler ve child kategoriler eklendi.';

