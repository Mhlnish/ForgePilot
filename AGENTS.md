<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## ForgePilot

- Brand primitives (logo) live in src/components/brand/; reusable gradients/shadows are @utility tokens in src/styles.css — why: keep visual system in one place.
- App is dark-first: `dark` class on <html> and :root holds the dark palette — why: product is dark-only for MVP.
