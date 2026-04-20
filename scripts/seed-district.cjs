/**
 * Seeds default admin account + demo district data.
 *
 * Commands:
 *   npm run seed:district   — admin (if missing) + district demo data
 *   npm run seed:admin      — admin only
 *
 * Env (optional):
 *   MONGODB_URI, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME, SEED_ADMIN_ROLE (admin|super-admin)
 *   SEED_ADMIN_RESET=1      — with seed:admin, reset password/name/role for existing user
 *
 * Defaults: admin@1550plus.com / admin123 (local dev only — change in production)
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  const allowEnvKey = (k) =>
    k === 'MONGODB_URI' ||
    k === 'NEXT_PUBLIC_WEBSITE_URL' ||
    k === 'NEXT_PUBLIC_BASE_URL' ||
    k.startsWith('SEED_ADMIN_');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!allowEnvKey(key)) continue;
    if (process.env[key]) continue;
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'super-admin'], default: 'admin' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

function getAdminModel() {
  return mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
}

/**
 * Creates default super-admin if missing. With SEED_ADMIN_RESET=1, updates existing user.
 */
async function seedAdmin() {
  const Admin = getAdminModel();
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@1550plus.com')
    .toLowerCase()
    .trim();
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const name = process.env.SEED_ADMIN_NAME || 'System Administrator';
  const role =
    process.env.SEED_ADMIN_ROLE === 'admin' ? 'admin' : 'super-admin';
  const reset = process.env.SEED_ADMIN_RESET === '1';

  let admin = await Admin.findOne({ email });
  if (admin) {
    if (reset) {
      admin.password = password;
      admin.name = name;
      admin.role = role;
      admin.isActive = true;
      await admin.save();
      console.log('Updated admin (SEED_ADMIN_RESET=1):', email);
    } else {
      console.log('Admin already exists (skipped):', email);
    }
    return admin;
  }

  admin = new Admin({
    email,
    password,
    name,
    role,
    isActive: true,
  });
  await admin.save();
  console.log('Created admin:', email, '| role:', role);
  console.log(
    '  Sign in with SEED_ADMIN_PASSWORD or default local password (see script header).'
  );
  return admin;
}

const DistrictSubmissionSchema = new mongoose.Schema(
  {
    districtName: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    districtSource: { type: String, trim: true, default: '' },
    representativeName: { type: String, required: true, trim: true },
    representativeRole: { type: String, trim: true, default: '' },
    representativeEmail: { type: String, required: true, lowercase: true, trim: true },
    representativePhone: { type: String, trim: true, default: '' },
    studentCount: { type: Number, required: true, min: 10 },
    submissionMethod: {
      type: String,
      enum: ['manual', 'csv', 'mixed'],
      required: true,
    },
    notes: { type: String, trim: true, default: '' },
    confirmationChecked: { type: Boolean, default: false },
    registrationCode: { type: String, unique: true, trim: true },
    status: {
      type: String,
      enum: [
        'New',
        'Under Review',
        'Ready for Generation',
        'Package In Progress',
        'Sent to Representative',
        'Partially Converted',
        'Completed',
        'Archived',
      ],
      default: 'New',
    },
    totalGenerated: { type: Number, default: 0 },
    totalPackaged: { type: Number, default: 0 },
    totalSentToRep: { type: Number, default: 0 },
    totalRegistered: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DistrictSubmissionSchema.index({ districtName: 1, schoolName: 1 }, { unique: true });

const DistrictStudentSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DistrictSubmission',
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    highSchoolName: { type: String, trim: true, default: '' },
    parentFirstName: { type: String, required: true, trim: true },
    parentLastName: { type: String, required: true, trim: true },
    parentEmail: { type: String, required: true, lowercase: true, trim: true },
    registrationCode: { type: String, trim: true, default: '' },
    registrationLink: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: [
        'Draft',
        'Imported',
        'Ready for Generation',
        'Generated',
        'Included in Package',
        'Sent to Representative',
        'Registered',
        'Skipped',
        'Delivery Issue',
      ],
      default: 'Draft',
    },
    generatedEmailContent: { type: String, default: '' },
    districtOriginTag: { type: Boolean, default: true },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const DistrictEmailTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

const DistrictPackageSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DistrictSubmission',
      required: true,
    },
    templateUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DistrictEmailTemplate',
      required: true,
    },
    studentCount: { type: Number, required: true, min: 1 },
    generatedAt: { type: Date, default: Date.now },
    sentAt: { type: Date, default: null },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    recipientEmail: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['created', 'sent', 'delivery_failed'],
      default: 'created',
    },
  },
  { timestamps: true }
);

const DistrictAuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistrictSubmission',
    default: null,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistrictStudent',
    default: null,
  },
  performedBy: { type: String, required: true, default: 'system' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

function getModels() {
  const DistrictSubmission =
    mongoose.models.DistrictSubmission ||
    mongoose.model('DistrictSubmission', DistrictSubmissionSchema);
  const DistrictStudent =
    mongoose.models.DistrictStudent ||
    mongoose.model('DistrictStudent', DistrictStudentSchema);
  const DistrictEmailTemplate =
    mongoose.models.DistrictEmailTemplate ||
    mongoose.model('DistrictEmailTemplate', DistrictEmailTemplateSchema);
  const DistrictPackage =
    mongoose.models.DistrictPackage ||
    mongoose.model('DistrictPackage', DistrictPackageSchema);
  const DistrictAuditLog =
    mongoose.models.DistrictAuditLog ||
    mongoose.model('DistrictAuditLog', DistrictAuditLogSchema);
  return {
    DistrictSubmission,
    DistrictStudent,
    DistrictEmailTemplate,
    DistrictPackage,
    DistrictAuditLog,
  };
}

function sampleStudents(prefix, schoolName, regCode, linkBase) {
  const first = [
    'Alex',
    'Jordan',
    'Taylor',
    'Morgan',
    'Casey',
    'Riley',
    'Quinn',
    'Avery',
    'Jamie',
    'Skyler',
    'Reese',
    'Drew',
  ];
  const last = [
    'Chen',
    'Patel',
    'Garcia',
    'Nguyen',
    'Okonkwo',
    'Silva',
    'Kim',
    'Martinez',
    'Brown',
    'Singh',
    'Lee',
    'Johnson',
  ];
  const statuses = [
    'Draft',
    'Imported',
    'Ready for Generation',
    'Generated',
    'Sent to Representative',
    'Registered',
    'Draft',
    'Imported',
    'Generated',
    'Generated',
    'Sent to Representative',
    'Draft',
  ];
  const rows = [];
  for (let i = 0; i < 12; i++) {
    rows.push({
      firstName: first[i],
      lastName: last[i],
      grade: `${9 + (i % 4)}`,
      highSchoolName: schoolName,
      parentFirstName: `Parent${i}`,
      parentLastName: last[i],
      parentEmail: `${prefix}parent${i}@example.com`,
      registrationCode: regCode,
      registrationLink: `${linkBase}/register?code=${encodeURIComponent(regCode)}`,
      status: statuses[i],
      districtOriginTag: true,
      generatedEmailContent:
        statuses[i] === 'Generated' ||
        statuses[i] === 'Sent to Representative' ||
        statuses[i] === 'Registered'
          ? `<p>Dear Parent${i} ${last[i]},</p><p>${first[i]} is invited to 1550+.</p><p>Code: ${regCode}</p>`
          : '',
    });
  }
  return rows;
}

async function main() {
  loadEnvLocal();
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/1550plus';
  await mongoose.connect(mongoUri);
  console.log('Connected:', mongoUri.replace(/\/\/.*@/, '//***@'));

  const seededAdmin = await seedAdmin();

  if (process.argv.includes('--admin-only')) {
    console.log('Done (admin only).');
    await mongoose.disconnect();
    return;
  }

  const {
    DistrictSubmission,
    DistrictStudent,
    DistrictEmailTemplate,
    DistrictPackage,
    DistrictAuditLog,
  } = getModels();

  const adminId = seededAdmin?._id || null;
  const adminName = seededAdmin?.name || 'seed';

  const linkBase =
    process.env.NEXT_PUBLIC_WEBSITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://1550plus.com';

  const seedTag = '[seed]';
  const seedCodes = ['DIST-SEED01', 'DIST-SEED02'];
  const oldSubs = await DistrictSubmission.find({
    $or: [
      { registrationCode: { $in: seedCodes } },
      { notes: { $regex: '\\[seed\\]', $options: 'i' } },
    ],
  })
    .select('_id')
    .lean();
  const oldIds = oldSubs.map((s) => s._id);
  if (oldIds.length) {
    await DistrictStudent.deleteMany({ submission: { $in: oldIds } });
    await DistrictPackage.deleteMany({ submission: { $in: oldIds } });
    await DistrictAuditLog.deleteMany({ submission: { $in: oldIds } });
    await DistrictSubmission.deleteMany({ _id: { $in: oldIds } });
  }
  await DistrictAuditLog.deleteMany({ 'details.seed': true });
  await DistrictEmailTemplate.deleteMany({ name: 'Demo District Invitation (seed)' });

  const templateBody = `<h2 style="color:#113076;">Scholarship invitation</h2>
<p>Dear {{ParentName}},</p>
<p>We are pleased to invite <strong>{{StudentName}}</strong> (Grade {{StudentGrade}}) from <strong>{{SchoolName}}</strong> in <strong>{{DistrictName}}</strong> to register for the 1550+ SAT program.</p>
<p>Registration link: <a href="{{RegistrationLink}}">{{RegistrationLink}}</a></p>
<p>District registration code: <strong>{{RegistrationCode}}</strong></p>
<p>Best,<br/>{{SenderName}}</p>`;

  const template = await DistrictEmailTemplate.create({
    name: 'Demo District Invitation (seed)',
    subject: '1550+ Scholarship — {{StudentName}}',
    body: templateBody,
    isActive: true,
    isApproved: true,
    createdBy: adminId,
  });
  console.log('Template:', template._id.toString());

  const sub1 = await DistrictSubmission.create({
    districtName: 'Riverside Unified',
    schoolName: 'Lincoln High School',
    districtSource: 'district-landing',
    representativeName: 'Maria Rodriguez',
    representativeRole: 'College Counselor',
    representativeEmail: 'mrodriguez.seed@example.com',
    representativePhone: '555-0100',
    studentCount: 12,
    submissionMethod: 'mixed',
    notes: `Initial cohort ${seedTag}`,
    confirmationChecked: true,
    registrationCode: 'DIST-SEED01',
    status: 'Ready for Generation',
    totalGenerated: 4,
    totalPackaged: 0,
    totalSentToRep: 2,
    totalRegistered: 1,
  });

  const sub2 = await DistrictSubmission.create({
    districtName: 'Metro ISD',
    schoolName: 'Washington Academy',
    districtSource: 'district-landing',
    representativeName: 'James Park',
    representativeRole: 'Assistant Principal',
    representativeEmail: 'jpark.seed@example.com',
    representativePhone: '555-0200',
    studentCount: 10,
    submissionMethod: 'csv',
    notes: `CSV import batch ${seedTag}`,
    confirmationChecked: true,
    registrationCode: 'DIST-SEED02',
    status: 'New',
    totalGenerated: 0,
    totalPackaged: 0,
    totalSentToRep: 0,
    totalRegistered: 0,
  });

  const students1 = sampleStudents(
    'rside',
    'Lincoln High School',
    sub1.registrationCode,
    linkBase
  ).map((s) => ({ ...s, submission: sub1._id, notes: seedTag }));

  const students2 = sampleStudents(
    'metro',
    'Washington Academy',
    sub2.registrationCode,
    linkBase
  )
    .slice(0, 10)
    .map((s, i) => ({
      ...s,
      firstName: ['Sam', 'Pat', 'Chris', 'Dana', 'Lee', 'Max', 'Noah', 'Eva', 'Ivy', 'Ben'][i],
      status: i < 3 ? 'Imported' : 'Draft',
      submission: sub2._id,
      notes: seedTag,
    }));

  await DistrictStudent.insertMany([...students1, ...students2]);

  const pkg = await DistrictPackage.create({
    submission: sub1._id,
    templateUsed: template._id,
    studentCount: 2,
    generatedAt: new Date(Date.now() - 86400000),
    sentAt: new Date(Date.now() - 3600000),
    sentBy: adminId,
    recipientEmail: sub1.representativeEmail,
    status: 'sent',
  });

  await DistrictAuditLog.insertMany([
    {
      action: 'district_registration_submitted',
      submission: sub1._id,
      performedBy: sub1.representativeName,
      details: { seed: true, note: 'Seeded submission 1' },
    },
    {
      action: 'template_created',
      performedBy: adminName,
      details: { seed: true, templateId: template._id.toString() },
    },
    {
      action: 'package_sent_to_representative',
      submission: sub1._id,
      performedBy: adminName,
      details: { seed: true, packageId: pkg._id.toString(), studentCount: 2 },
    },
  ]);

  await DistrictSubmission.findByIdAndUpdate(sub1._id, {
    studentCount: 12,
    totalGenerated: await DistrictStudent.countDocuments({
      submission: sub1._id,
      status: {
        $in: [
          'Generated',
          'Included in Package',
          'Sent to Representative',
          'Registered',
        ],
      },
    }),
    totalRegistered: await DistrictStudent.countDocuments({
      submission: sub1._id,
      status: 'Registered',
    }),
    totalSentToRep: await DistrictStudent.countDocuments({
      submission: sub1._id,
      status: 'Sent to Representative',
    }),
  });

  console.log('Seeded submissions:', sub1._id.toString(), sub2._id.toString());
  console.log('Students:', students1.length + students2.length);
  console.log('Template approved:', template.isApproved);
  console.log('Done.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
