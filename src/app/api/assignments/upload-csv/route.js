import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

// Upload CSV and create assignment (Admin only)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Verify admin token
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    if (!['admin', 'super-admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    const formData = await request.formData();
    const file = formData.get('csvFile');
    const title = formData.get('title');
    const description = formData.get('description');
    const timeLimit = formData.get('timeLimit');
    
    if (!file || !title) {
      return NextResponse.json(
        { error: 'CSV file and title are required' },
        { status: 400 }
      );
    }
    
    // Convert file to text
    const csvText = await file.text();
    
    // Parse CSV
    const questions = [];
    const errors = [];
    
    return new Promise((resolve) => {
      const stream = Readable.from([csvText]);
      let rowIndex = 0;
      
      stream
        .pipe(csvParser())
        .on('data', (row) => {
          rowIndex++;
          
          // Expected columns: Question, Instruction, Option A, Option B, Option C, Option D, Answer
          const question = row['Question']?.trim();
          const instruction = row['Instruction']?.trim() || '';
          const optionA = row['Option A']?.trim();
          const optionB = row['Option B']?.trim();
          const optionC = row['Option C']?.trim();
          const optionD = row['Option D']?.trim();
          const answer = row['Answer']?.trim().toUpperCase();
          
          // Validation
          if (!question) {
            errors.push(`Row ${rowIndex}: Question is required`);
            return;
          }
          
          if (!optionA || !optionB || !optionC || !optionD) {
            errors.push(`Row ${rowIndex}: All options (A, B, C, D) are required`);
            return;
          }
          
          if (!['A', 'B', 'C', 'D'].includes(answer)) {
            errors.push(`Row ${rowIndex}: Answer must be A, B, C, or D`);
            return;
          }
          
          questions.push({
            question,
            instruction,
            optionA,
            optionB,
            optionC,
            optionD,
            answer
          });
        })
        .on('end', async () => {
          try {
            if (errors.length > 0) {
              resolve(NextResponse.json(
                { error: 'CSV validation errors', details: errors },
                { status: 400 }
              ));
              return;
            }
            
            if (questions.length === 0) {
              resolve(NextResponse.json(
                { error: 'No valid questions found in CSV' },
                { status: 400 }
              ));
              return;
            }
            
            // Create assignment
            const assignment = new Assignment({
              title,
              description: description || '',
              timeLimit: parseInt(timeLimit) || 60,
              questions,
              createdBy: decoded.adminId
            });
            
            await assignment.save();
            
            // Populate creator info for response
            await assignment.populate('createdBy', 'firstName lastName email');
            
            resolve(NextResponse.json({
              message: 'Assignment created successfully from CSV',
              assignment: assignment.toObject(),
              questionsImported: questions.length
            }, { status: 201 }));
            
          } catch (saveError) {
            console.error('Error saving assignment:', saveError);
            resolve(NextResponse.json(
              { error: 'Error saving assignment to database' },
              { status: 500 }
            ));
          }
        })
        .on('error', (parseError) => {
          console.error('CSV parsing error:', parseError);
          resolve(NextResponse.json(
            { error: 'Error parsing CSV file' },
            { status: 400 }
          ));
        });
    });
    
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
