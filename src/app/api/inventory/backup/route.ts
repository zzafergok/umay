import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api/route-helpers';
import {
  listCategories,
  listItems,
  listLocations,
  listParts,
  listReplacementLogs,
  listShoppingItems,
  listStockMovements,
  getUserSettings,
} from '@/lib/inventory/repo';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const [
      locations,
      categories,
      items,
      parts,
      replacementLogs,
      stockMovements,
      shoppingList,
      settings,
    ] = await Promise.all([
      listLocations(auth.uid),
      listCategories(auth.uid),
      listItems(auth.uid, true),
      listParts(auth.uid),
      listReplacementLogs(auth.uid),
      listStockMovements(auth.uid),
      listShoppingItems(auth.uid),
      getUserSettings(auth.uid),
    ]);

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      version: 1,
      locations,
      categories,
      items,
      parts,
      replacementLogs,
      stockMovements,
      shoppingList,
      settings,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
