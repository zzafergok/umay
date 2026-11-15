import { Shield } from 'lucide-react';
import { Button } from '@/components/core/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/card';
import { Link } from '@/components/core/link';
import { Separator } from '@/components/core/separator';
import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { GoogleSignInButton } from './components/google-signin-button';
import { PublicLoginForm } from './components/public-login-form';
import { getPublicLoginCopy } from './i18n';

export async function PublicLoginScreen() {
  const locale = await getCurrentLocale();
  const copy = getPublicLoginCopy(locale);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-5 py-12">
      <Card className="w-full border-gunmetal bg-obsidian shadow-2xl">
        <CardHeader>
          <CardTitle className="uppercase tracking-tight">
            {copy.title}
          </CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PublicLoginForm copy={copy} />

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase text-muted-foreground">
              {locale === 'en' ? 'or' : 'veya'}
            </span>
            <Separator className="flex-1" />
          </div>

          <GoogleSignInButton
            label={
              locale === 'en'
                ? 'Continue with Google'
                : 'Google ile Devam Et'
            }
          />

          <Button
            asChild
            variant="ghost"
            className="w-full rounded-none text-xs uppercase tracking-widest text-muted-foreground"
          >
            <Link href="/admin/login">
              <Shield className="mr-2 h-3.5 w-3.5" />
              {copy.adminLoginLabel}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
