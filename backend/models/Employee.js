import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const employeeSchema = new mongoose.Schema(
  {
    // Authentication
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      match: [/^EMP\d{3,}$/, 'Employee ID must be in format EMP001, EMP002, etc.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['employee', 'hr', 'admin'],
      default: 'employee',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // Personal Information
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    avatar: {
      type: String,
      default: function() {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.employeeId}`;
      }
    },

    // Emergency Contact
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },

    // Job Information
    department: {
      type: String,
      default: 'General',
    },
    position: {
      type: String,
      default: 'Employee',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },

    // Salary Information
    salary: {
      type: Number,
      default: 50000,
    },
    salaryStructure: {
      baseSalary: {
        type: Number,
        default: 50000,
      },
      allowances: {
        houseRent: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        transport: { type: Number, default: 0 },
        special: { type: Number, default: 0 },
      },
      deductions: {
        providentFund: { type: Number, default: 0 },
        professionalTax: { type: Number, default: 0 },
        incomeTax: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
      },
    },

    // Leave Balance
    leaveBalance: {
      paid: { type: Number, default: 12 },
      sick: { type: Number, default: 7 },
      unpaid: { type: Number, default: 5 },
      total: { type: Number, default: 24 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 24 },
    },

    // Documents
    documents: [
      {
        type: {
          type: String,
          enum: ['Resume', 'ID Proof', 'Address Proof', 'Certificate', 'Other'],
        },
        url: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
employeeSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate salary structure automatically
employeeSchema.pre('save', function (next) {
  if (this.isModified('salary')) {
    const baseSalary = this.salary;
    this.salaryStructure.baseSalary = baseSalary;
    this.salaryStructure.allowances.houseRent = Math.round(baseSalary * 0.2);
    this.salaryStructure.allowances.medical = Math.round(baseSalary * 0.067);
    this.salaryStructure.allowances.transport = Math.round(baseSalary * 0.04);
    this.salaryStructure.allowances.special = Math.round(baseSalary * 0.027);
    this.salaryStructure.deductions.providentFund = Math.round(baseSalary * 0.12);
    this.salaryStructure.deductions.professionalTax = 200;
    this.salaryStructure.deductions.incomeTax = Math.round(baseSalary * 0.1);
  }
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
