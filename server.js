const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase bilgileri eksik.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function checkAdmin(req, res, next) {
  const password = req.headers["x-admin-password"];

  if (!adminPassword) {
    return res.status(500).json({
      error: "ADMIN_PASSWORD tanımlı değil.",
    });
  }

  if (password !== adminPassword) {
    return res.status(401).json({
      error: "Yetkisiz işlem.",
    });
  }

  next();
}

app.get("/", (req, res) => {
  res.json({
    message: "Ruth Istanbul Admin API çalışıyor.",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ruth-admin-api",
  });
});

/**
 * ÜRÜNLERİ LİSTELE
 */
app.get("/api/products", checkAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      collections (
        id,
        name,
        slug
      )
    `)
    .order("sort_order", { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

/**
 * TEK ÜRÜN GETİR
 */
app.get("/api/products/:id", checkAdmin, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

/**
 * ÜRÜN EKLE
 */
app.post("/api/products", checkAdmin, async (req, res) => {
  const payload = req.body;

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
});

/**
 * ÜRÜN DÜZENLE
 */
app.patch("/api/products/:id", checkAdmin, async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

/**
 * ÜRÜN SİLME YERİNE ARŞİVLE
 */
app.delete("/api/products/:id", checkAdmin, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    message: "Ürün arşivlendi.",
    product: data,
  });
});

/**
 * KOLEKSİYONLARI LİSTELE
 */
app.get("/api/collections", checkAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

/**
 * ANASAYFA BÖLÜMLERİ
 */
app.get("/api/homepage-sections", checkAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

/**
 * ANASAYFA BÖLÜMÜ DÜZENLE
 */
app.patch("/api/homepage-sections/:id", checkAdmin, async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const { data, error } = await supabase
    .from("homepage_sections")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

/**
 * SITE SETTINGS
 */
app.get("/api/site-settings", checkAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("setting_key", { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Ruth Admin API çalışıyor: http://localhost:${PORT}`);
});