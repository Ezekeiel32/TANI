import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
  const { bookingId, userId, name, signatureDataUrl, ip, userAgent } = await req.json();
  if (!bookingId || !userId || !name || !signatureDataUrl) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { user: true, service: true } });
  if (!booking) return Response.json({ error: 'Invalid booking' }, { status: 404 });

  // Generate simple PDF (stored base64 for demo; replace with S3 in production)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();
  page.drawText('Liability Waiver & Cancellation Policy', { x: 50, y: height - 80, size: 18, font, color: rgb(0, 0, 0) });
  page.drawText(`Name: ${name}`, { x: 50, y: height - 120, size: 12, font });
  page.drawText(`Booking: ${booking.service.name} on ${booking.start.toISOString()}`, { x: 50, y: height - 140, size: 12, font });
  page.drawText(`Signed At: ${new Date().toISOString()}`, { x: 50, y: height - 160, size: 12, font });
  page.drawText(`IP: ${ip || ''}`, { x: 50, y: height - 180, size: 12, font });
  // Signature image (data URL)
  const pngBytes = Buffer.from(signatureDataUrl.split(',')[1], 'base64');
  const png = await pdfDoc.embedPng(pngBytes);
  const scaled = png.scale(0.5);
  page.drawImage(png, { x: 50, y: height - 320, width: scaled.width, height: scaled.height });

  const pdfBytes = await pdfDoc.save();
  let pdfUrl: string | undefined;
  if (process.env.AWS_S3_BUCKET && process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    const key = `waivers/${bookingId}.pdf`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: Buffer.from(pdfBytes),
      ContentType: 'application/pdf',
    }));
    pdfUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } else {
    pdfUrl = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString('base64')}`;
  }

  const waiver = await prisma.waiverSignature.upsert({
    where: { bookingId },
    update: { signedAt: new Date(), ip, userAgent, pdfUrl },
    create: { bookingId, userId, signedAt: new Date(), ip, userAgent, pdfUrl },
  });

  return Response.json({ waiver });
}



