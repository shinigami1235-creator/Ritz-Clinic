"""Writes data/social.json: the clinic's latest Facebook posts and each Instagram account's
live stories (or latest posts when no story is up). The website reads that file, so the
lounge stays up to date with no one touching the site.

One-time setup by the clinic's Facebook/Instagram admin:
1. In Meta for Developers, make an app, add "Facebook Login for Business" and the
   Instagram Graph API, and connect the THE RITZ Facebook page plus the six Instagram
   accounts (each must be a Business or Creator account linked to a Facebook page).
2. Generate a long-lived Page access token with pages_read_engagement,
   instagram_basic and instagram_manage_insights.
3. Put the token and IDs in the environment where this runs:
     META_TOKEN=...            the long-lived page token
     FB_PAGE_ID=...            THE RITZ page id
     IG_ACCOUNTS=theritzclinic_official:1784...,theritz.lifting:1784...   handle:ig-user-id pairs
4. Run it every hour (cron on the clinic's server, or a scheduled job), then publish data/social.json.

Run:  python3 tools/social.py
"""
import json, os, pathlib, sys, urllib.parse, urllib.request
from datetime import datetime, timezone

API = 'https://graph.facebook.com/v21.0/'
OUT = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'social.json'


def get(path, **params):
    params['access_token'] = os.environ['META_TOKEN']
    with urllib.request.urlopen(API + path + '?' + urllib.parse.urlencode(params), timeout=30) as r:
        return json.load(r)


def main():
    out = {'updated': datetime.now(timezone.utc).isoformat(), 'facebook': [], 'instagram': {}}
    page = os.environ.get('FB_PAGE_ID')
    if page:
        out['facebook'] = get(f'{page}/posts', fields='message,full_picture,permalink_url,created_time', limit=8).get('data', [])
    for pair in filter(None, os.environ.get('IG_ACCOUNTS', '').split(',')):
        handle, ig = pair.split(':')
        fields = 'media_type,media_url,thumbnail_url,permalink,timestamp'
        stories = get(f'{ig}/stories', fields=fields).get('data', [])
        media = [] if stories else get(f'{ig}/media', fields=fields, limit=6).get('data', [])
        out['instagram'][handle] = {'stories': stories, 'media': media}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
    print('wrote', OUT, len(out['facebook']), 'posts,', len(out['instagram']), 'accounts')


if __name__ == '__main__':
    sys.exit(main())
