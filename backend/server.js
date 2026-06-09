require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.CMS_PASSWORD || 'admin';
const allowed = (process.env.CORS_ORIGIN || '*').split(',').map(s=>s.trim());
app.use(cors({origin:(origin, cb)=>{ if(!origin || allowed.includes('*') || allowed.includes(origin)) return cb(null,true); cb(new Error('Not allowed by CORS')); }}));
app.use(express.json({limit:'2mb'}));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));
app.use('/admin', express.static(path.join(__dirname,'public','admin')));

const db = new Database(path.join(__dirname,'data','meridian-cms.sqlite'));
db.exec(`CREATE TABLE IF NOT EXISTS speakers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, title TEXT, company TEXT, linkedin TEXT, image TEXT, featured INTEGER DEFAULT 0, active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS partners (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT, tier TEXT, logo TEXT, website TEXT, active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
function auth(req,res,next){ const h=req.headers['x-admin-password']; if(h && h===PASSWORD) return next(); res.status(401).json({error:'Invalid CMS password'}); }
const upload = multer({storage: multer.diskStorage({destination:(req,file,cb)=>cb(null,path.join(__dirname,'uploads')), filename:(req,file,cb)=>{const safe=Date.now()+'-'+file.originalname.toLowerCase().replace(/[^a-z0-9.]+/g,'-'); cb(null,safe)}})});

function normalizeSpeaker(r){return {id:r.id,name:r.name,title:r.title||'',company:r.company||'',linkedin:r.linkedin||'',image:r.image||'',featured:!!r.featured,active:!!r.active,order:r.sort_order||0};}
function normalizePartner(r){return {id:r.id,name:r.name,category:r.category||'',tier:r.tier||'',logo:r.logo||'',website:r.website||'',active:!!r.active,order:r.sort_order||0};}
app.get('/api/speakers',(req,res)=>res.json(db.prepare('SELECT * FROM speakers WHERE active=1 ORDER BY sort_order,id').all().map(normalizeSpeaker)));
app.get('/api/partners',(req,res)=>res.json(db.prepare('SELECT * FROM partners WHERE active=1 ORDER BY sort_order,id').all().map(normalizePartner)));
app.get('/api/admin/speakers',auth,(req,res)=>res.json(db.prepare('SELECT * FROM speakers ORDER BY sort_order,id').all().map(normalizeSpeaker)));
app.get('/api/admin/partners',auth,(req,res)=>res.json(db.prepare('SELECT * FROM partners ORDER BY sort_order,id').all().map(normalizePartner)));
app.post('/api/admin/speakers',auth,(req,res)=>{const b=req.body; const info=db.prepare('INSERT INTO speakers(name,title,company,linkedin,image,featured,active,sort_order) VALUES(?,?,?,?,?,?,?,?)').run(b.name,b.title,b.company,b.linkedin,b.image,b.featured?1:0,b.active===false?0:1,b.order||0); res.json({id:info.lastInsertRowid});});
app.put('/api/admin/speakers/:id',auth,(req,res)=>{const b=req.body; db.prepare('UPDATE speakers SET name=?,title=?,company=?,linkedin=?,image=?,featured=?,active=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(b.name,b.title,b.company,b.linkedin,b.image,b.featured?1:0,b.active===false?0:1,b.order||0,req.params.id); res.json({ok:true});});
app.delete('/api/admin/speakers/:id',auth,(req,res)=>{db.prepare('DELETE FROM speakers WHERE id=?').run(req.params.id); res.json({ok:true});});
app.post('/api/admin/partners',auth,(req,res)=>{const b=req.body; const info=db.prepare('INSERT INTO partners(name,category,tier,logo,website,active,sort_order) VALUES(?,?,?,?,?,?,?)').run(b.name,b.category,b.tier,b.logo,b.website,b.active===false?0:1,b.order||0); res.json({id:info.lastInsertRowid});});
app.put('/api/admin/partners/:id',auth,(req,res)=>{const b=req.body; db.prepare('UPDATE partners SET name=?,category=?,tier=?,logo=?,website=?,active=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(b.name,b.category,b.tier,b.logo,b.website,b.active===false?0:1,b.order||0,req.params.id); res.json({ok:true});});
app.delete('/api/admin/partners/:id',auth,(req,res)=>{db.prepare('DELETE FROM partners WHERE id=?').run(req.params.id); res.json({ok:true});});
app.post('/api/admin/upload',auth,upload.single('file'),(req,res)=>res.json({url:'/uploads/'+req.file.filename}));
app.get('/',(req,res)=>res.redirect('/admin/'));
app.listen(PORT,()=>console.log(`Meridian CMS running on http://localhost:${PORT}/admin`));
