import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;
  
  // Verify with password or 2FA in production
  const { confirmDelete } = await req.json();
  if (confirmDelete !== 'DELETE MY ACCOUNT') {
    return Response.json({ error: 'Invalid confirmation' }, { status: 400 });
  }
  
  // Delete user and cascade to related data
  await prisma.user.delete({
    where: { id: userId },
  });
  
  return Response.json({ message: 'Account deleted successfully' });
}
