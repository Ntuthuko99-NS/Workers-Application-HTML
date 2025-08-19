diff --git a/marketplace-app/server.js b/marketplace-app/server.js
--- a/marketplace-app/server.js
+++ b/marketplace-app/server.js
@@ -1,99 +1,331 @@
-import express from 'express';
-import cors from 'cors';
-import path from 'path';
-import { fileURLToPath } from 'url';
-import jwt from 'jsonwebtoken';
-
-const __filename = fileURLToPath(import.meta.url);
-const __dirname = path.dirname(__filename);
-
-const app = express();
-app.use(cors());
-app.use(express.json());
-
-// Static frontend
-app.use(express.static(path.join(__dirname, 'public')));
-
-// Mock data
-const categories = [
-  { id: 'furniture', name: 'Furniture', icon: '🛋️' },
-  { id: 'electronics', name: 'Electronics', icon: '📱' },
-  { id: 'clothing', name: 'Clothing', icon: '👕' },
-  { id: 'books', name: 'Books', icon: '📚' },
-  { id: 'games', name: 'Games', icon: '🎮' }
-];
-
-const listings = [
-  {
-    id: 'sofa-1',
-    title: 'Leather Sofa',
-    description: 'Excellent condition',
-    price: 250,
-    distanceKm: 0.5,
-    imageUrl: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=1600&auto=format&fit=crop',
-    categoryId: 'furniture'
-  },
-  {
-    id: 'iphone-13-pro',
-    title: 'iPhone 13 Pro',
-    description: '128GB, unlocked',
-    price: 650,
-    distanceKm: 1.2,
-    imageUrl: 'https://images.unsplash.com/photo-1633113083876-98d9a6a3e6e9?q=80&w=1600&auto=format&fit=crop',
-    categoryId: 'electronics'
-  },
-  {
-    id: 'bike-1',
-    title: 'Vintage Bicycle',
-    description: 'Well-maintained',
-    price: 120,
-    distanceKm: 0.8,
-    imageUrl: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=1600&auto=format&fit=crop',
-    categoryId: 'games'
-  },
-  {
-    id: 'knife-1',
-    title: 'Knife Set',
-    description: 'Premium quality',
-    price: 40,
-    distanceKm: 1.5,
-    imageUrl: 'https://images.unsplash.com/photo-1526312472041-40c32004f7fb?q=80&w=1600&auto=format&fit=crop',
-    categoryId: 'books'
-  }
-];
-
-app.get('/api/categories', (_req, res) => {
-  res.json({ categories });
-});
-
-app.get('/api/listings', (req, res) => {
-  const { nearKm } = req.query;
-  let result = listings;
-  if (nearKm) {
-    const limit = Number(nearKm);
-    if (!Number.isNaN(limit)) {
-      result = listings.filter(l => l.distanceKm <= limit);
-    }
-  }
-  res.json({ listings: result });
-});
-
-const port = process.env.PORT || 3000;
-app.listen(port, () => {
-  console.log(`Server running on http://localhost:${port}`);
-});
-
-// --- Simple auth (demo only) ---
-const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
-const USERS = [
-  { id: 'u1', name: 'Demo User', email: 'demo@example.com', password: 'password123' }
-];
-
-app.post('/api/login', (req, res) => {
-  const { email, password } = req.body || {};
-  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
-  const user = USERS.find(u => u.email === email && u.password === password);
-  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
-  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
-  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
-});
+import express from 'express';
+import cors from 'cors';
+import path from 'path';
+import { fileURLToPath } from 'url';
+import jwt from 'jsonwebtoken';
+import { promises as fs } from 'fs';
+import { randomUUID } from 'crypto';
+
+const __filename = fileURLToPath(import.meta.url);
+const __dirname = path.dirname(__filename);
+
+const app = express();
+app.use(cors());
+app.use(express.json());
+
+// Static frontend
+app.use(express.static(path.join(__dirname, 'public')));
+
+// Mock data
+const categories = [
+  { id: 'furniture', name: 'Furniture', icon: '🛋️' },
+  { id: 'electronics', name: 'Electronics', icon: '📱' },
+  { id: 'clothing', name: 'Clothing', icon: '👕' },
+  { id: 'books', name: 'Books', icon: '📚' },
+  { id: 'games', name: 'Games', icon: '🎮' }
+];
+
+const listings = [
+  {
+    id: 'sofa-1',
+    title: 'Leather Sofa',
+    description: 'Excellent condition',
+    price: 250,
+    distanceKm: 0.5,
+    imageUrl: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=1600&auto=format&fit=crop',
+    categoryId: 'furniture'
+  },
+  {
+    id: 'iphone-13-pro',
+    title: 'iPhone 13 Pro',
+    description: '128GB, unlocked',
+    price: 650,
+    distanceKm: 1.2,
+    imageUrl: 'https://images.unsplash.com/photo-1633113083876-98d9a6a3e6e9?q=80&w=1600&auto=format&fit=crop',
+    categoryId: 'electronics'
+  },
+  {
+    id: 'bike-1',
+    title: 'Vintage Bicycle',
+    description: 'Well-maintained',
+    price: 120,
+    distanceKm: 0.8,
+    imageUrl: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=1600&auto=format&fit=crop',
+    categoryId: 'games'
+  },
+  {
+    id: 'knife-1',
+    title: 'Knife Set',
+    description: 'Premium quality',
+    price: 40,
+    distanceKm: 1.5,
+    imageUrl: 'https://images.unsplash.com/photo-1526312472041-40c32004f7fb?q=80&w=1600&auto=format&fit=crop',
+    categoryId: 'books'
+  }
+];
+
+app.get('/api/categories', (_req, res) => {
+  res.json({ categories });
+});
+
+app.get('/api/listings', (req, res) => {
+  const { nearKm } = req.query;
+  let result = listings;
+  if (nearKm) {
+    const limit = Number(nearKm);
+    if (!Number.isNaN(limit)) {
+      result = listings.filter(l => l.distanceKm <= limit);
+    }
+  }
+  res.json({ listings: result });
+});
+
+const port = process.env.PORT || 3000;
+app.listen(port, () => {
+  console.log(`Server running on http://localhost:${port}`);
+});
+
+// --- Simple auth (demo only) ---
+const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
+const USERS = [
+  { id: 'u1', name: 'Demo User', email: 'demo@example.com', password: 'password123' }
+];
+
+app.post('/api/login', (req, res) => {
+  const { email, password } = req.body || {};
+  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
+  const user = USERS.find(u => u.email === email && u.password === password);
+  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
+  const token = jwt.sign({ sub: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
+  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
+});
+
+// --- Auth middleware for protected routes ---
+function authenticate(req, res, next) {
+  try {
+    const authHeader = req.headers['authorization'] || '';
+    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
+    if (!token) return res.status(401).json({ error: 'Missing bearer token' });
+    const payload = jwt.verify(token, JWT_SECRET);
+    req.user = { id: payload.sub, name: payload.name, email: payload.email };
+    next();
+  } catch (error) {
+    return res.status(401).json({ error: 'Invalid or expired token' });
+  }
+}
+
+// --- Time Records storage (file-based) ---
+const DATA_DIR = path.join(__dirname, 'data');
+const TIME_RECORDS_FILE = path.join(DATA_DIR, 'timeRecords.json');
+
+async function ensureDataFile() {
+  await fs.mkdir(DATA_DIR, { recursive: true });
+  try {
+    await fs.access(TIME_RECORDS_FILE);
+  } catch {
+    // Seed with sample data for the demo user if file does not exist
+    const seed = generateSeedTimeRecords('u1');
+    await fs.writeFile(TIME_RECORDS_FILE, JSON.stringify(seed, null, 2), 'utf-8');
+  }
+}
+
+async function loadTimeRecords() {
+  await ensureDataFile();
+  const content = await fs.readFile(TIME_RECORDS_FILE, 'utf-8');
+  return JSON.parse(content);
+}
+
+async function saveTimeRecords(allRecords) {
+  await fs.writeFile(TIME_RECORDS_FILE, JSON.stringify(allRecords, null, 2), 'utf-8');
+}
+
+function parseTimeToMinutes(timeString) {
+  if (!timeString) return null;
+  const [hoursStr, minutesStr] = timeString.split(':');
+  const hours = Number(hoursStr);
+  const minutes = Number(minutesStr);
+  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
+  return hours * 60 + minutes;
+}
+
+function computeHoursDecimal(clockIn, clockOut) {
+  const startMinutes = parseTimeToMinutes(clockIn);
+  const endMinutes = parseTimeToMinutes(clockOut);
+  if (startMinutes == null || endMinutes == null) return null;
+  const diffMinutes = endMinutes - startMinutes;
+  if (diffMinutes < 0) return null; // same-day only for demo
+  return Number((diffMinutes / 60).toFixed(2));
+}
+
+function calculateStatus(clockIn, clockOut) {
+  return clockIn && clockOut ? 'completed' : 'pending';
+}
+
+function generateSeedTimeRecords(userId) {
+  const sample = [
+    ['2023-06-01', '08:00', '17:00'],
+    ['2023-06-02', '08:30', '17:30'],
+    ['2023-06-05', '09:00', '18:15'],
+    ['2023-06-06', '08:45', '17:45'],
+    ['2023-06-07', '08:15', '17:30'],
+    ['2023-06-08', '09:00', '17:00'],
+    ['2023-06-09', '08:00', '16:00'],
+    ['2023-06-12', '08:30', '17:45'],
+    ['2023-06-13', '08:15', '17:15'],
+    ['2023-06-14', '09:10', '18:20']
+  ];
+  return sample.map(([date, clockIn, clockOut]) => {
+    const hours = computeHoursDecimal(clockIn, clockOut);
+    const status = calculateStatus(clockIn, clockOut);
+    return { id: randomUUID(), userId, date, clockIn, clockOut, hours, status };
+  });
+}
+
+// --- Time Records API ---
+// All routes below require authentication
+app.get('/api/time-records', authenticate, async (req, res) => {
+  try {
+    const { page = '1', pageSize = '10', from, to, status } = req.query;
+    const currentUserId = req.user.id;
+
+    const allRecords = await loadTimeRecords();
+    let records = allRecords.filter(r => r.userId === currentUserId);
+
+    if (from) {
+      records = records.filter(r => r.date >= String(from));
+    }
+    if (to) {
+      records = records.filter(r => r.date <= String(to));
+    }
+    if (status) {
+      records = records.filter(r => r.status === status);
+    }
+
+    // sort by date ascending
+    records.sort((a, b) => a.date.localeCompare(b.date));
+
+    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
+    const sizeNum = Math.max(1, Math.min(100, parseInt(String(pageSize), 10) || 10));
+    const total = records.length;
+    const totalPages = Math.max(1, Math.ceil(total / sizeNum));
+    const startIndex = (pageNum - 1) * sizeNum;
+    const paged = records.slice(startIndex, startIndex + sizeNum);
+
+    res.json({
+      items: paged,
+      page: pageNum,
+      pageSize: sizeNum,
+      total,
+      totalPages
+    });
+  } catch (error) {
+    res.status(500).json({ error: 'Failed to fetch time records' });
+  }
+});
+
+app.get('/api/time-records/:id', authenticate, async (req, res) => {
+  try {
+    const { id } = req.params;
+    const allRecords = await loadTimeRecords();
+    const record = allRecords.find(r => r.id === id && r.userId === req.user.id);
+    if (!record) return res.status(404).json({ error: 'Record not found' });
+    res.json(record);
+  } catch (error) {
+    res.status(500).json({ error: 'Failed to fetch record' });
+  }
+});
+
+app.post('/api/time-records', authenticate, async (req, res) => {
+  try {
+    const { date, clockIn, clockOut } = req.body || {};
+    if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
+    if (!clockIn && !clockOut) return res.status(400).json({ error: 'Provide at least clockIn or clockOut' });
+
+    const allRecords = await loadTimeRecords();
+
+    const hours = computeHoursDecimal(clockIn, clockOut);
+    const status = calculateStatus(clockIn, clockOut);
+    const newRecord = {
+      id: randomUUID(),
+      userId: req.user.id,
+      date,
+      clockIn: clockIn || null,
+      clockOut: clockOut || null,
+      hours,
+      status
+    };
+
+    allRecords.push(newRecord);
+    await saveTimeRecords(allRecords);
+    res.status(201).json(newRecord);
+  } catch (error) {
+    res.status(500).json({ error: 'Failed to create record' });
+  }
+});
+
+app.patch('/api/time-records/:id', authenticate, async (req, res) => {
+  try {
+    const { id } = req.params;
+    const { date, clockIn, clockOut, status } = req.body || {};
+    const allRecords = await loadTimeRecords();
+    const existingIndex = allRecords.findIndex(r => r.id === id && r.userId === req.user.id);
+    if (existingIndex === -1) return res.status(404).json({ error: 'Record not found' });
+
+    const updated = { ...allRecords[existingIndex] };
+    if (date) updated.date = date;
+    if (clockIn !== undefined) updated.clockIn = clockIn;
+    if (clockOut !== undefined) updated.clockOut = clockOut;
+    // status can be forced (e.g. admin fix), otherwise recompute
+    if (status) {
+      updated.status = status;
+    } else {
+      updated.status = calculateStatus(updated.clockIn, updated.clockOut);
+    }
+    updated.hours = computeHoursDecimal(updated.clockIn, updated.clockOut);
+
+    allRecords[existingIndex] = updated;
+    await saveTimeRecords(allRecords);
+    res.json(updated);
+  } catch (error) {
+    res.status(500).json({ error: 'Failed to update record' });
+  }
+});
+
+app.delete('/api/time-records/:id', authenticate, async (req, res) => {
+  try {
+    const { id } = req.params;
+    const allRecords = await loadTimeRecords();
+    const beforeCount = allRecords.length;
+    const remaining = allRecords.filter(r => !(r.id === id && r.userId === req.user.id));
+    if (remaining.length === beforeCount) return res.status(404).json({ error: 'Record not found' });
+    await saveTimeRecords(remaining);
+    res.status(204).end();
+  } catch (error) {
+    res.status(500).json({ error: 'Failed to delete record' });
+  }
+});
+
+app.get('/api/time-records/summary', authenticate, async (req, res) => {
+  try {
+    const { from, to } = req.query;
+    const allRecords = await loadTimeRecords();
+    const records = allRecords
+      .filter(r => r.userId === req.user.id)
+      .filter(r => (from ? r.date >= String(from) : true))
+      .filter(r => (to ? r.date <= String(to) : true));
+
+    const totalHours = Number(
+      records.reduce((sum, r) => sum + (typeof r.hours === 'number' ? r.hours : 0), 0).toFixed(2)
+    );
+    const daysCount = new Set(records.map(r => r.date)).size;
+    const completed = records.filter(r => r.status === 'completed').length;
+    const pending = records.filter(r => r.status !== 'completed').length;
+
+    res.json({ totalHours, daysCount, completed, pending });
+  } catch (error) {
+    res.status(500).json({ error: 'Failed to compute summary' });
+  }
+});
+
+
+
  
