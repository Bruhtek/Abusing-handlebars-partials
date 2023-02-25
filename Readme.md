# Nadużywanie handlebarsowych partialsów

## Wprowadzenie
System layoutów w `express-handlebars` jest bardzo ograniczony: nie pozwala na dodanie kilku miejsc, które można nadpisać, na przykład:
- Znacznik `<title>` w `<head>`
- Dodatkowe skrypty lub linki w `<head>` (np. styl lub skrypt dla strony logowania)
Ponadto, w mojej opinii, nie jest najlepszy — nie pozwala na wybranie layoutu z pliku .hbs, ale wymaga ustawienie go w kodzie.

## Rozwiązanie
W tym repozytorium znajduje się przykład użycia `express-handlebars` poprzez używanie warunkowych partialsów, oraz ich inline'owania.
Podczas kiedy to rozwiązanie ma wiele zalet, posiada także kilka wad:
- Konieczność ustawienia `partialsDir` w silniku handlebars — zmienna ta musi być ustawiona na katalog, w którym znajdują się zarówno partialsy, jak i layouty. Wymaga to includowania partialsów i layoutów poprzez odpowiednio `{{> partials/nazwa}}` i `{{> layouts/nazwa}}`.
- Brak możliwości wyboru domyślnego layoutu — konieczne jest ustawienia `defaultLayout` na false, a następnie includowanie layoutu w każdym widoku.

Mimo tego, rozwiązanie to zapewnia znaczącą elastyczność w tworzeniu layoutów, a także pozwala na łatwe nadpisywanie ich domyślnych wartości.
Do przykładów użycia można zaliczyć:
- Dodanie do `<head>` linku do arkusza stylów dla strony logowania.
- Ustawienie domyślnych wartości dla strony, z możliwością późniejszego ich nadpisania, na przykład `<title>` lub domyślny `header` i `footer`.

## Metodyka
Domyślnie, w wypadku próby dodania nieistniejącego partialsa, silnik handlebars zwraca błąd. Jednakże, jeżeli zamiast `{{> nazwa}}`, użyjemy `{{#> nazwa}}{{/nazwa}}` następuje dodanie warunkowe partialsa — jeżeli nie istnieje, wykorzystany zostanie kod z wnętrza z bloku. Istnieje także metoda `{{#*inline "nazwa"}}{{/inline}}`, która pozwala na modyfikację warunkowo dodanego partialsa. Przykładowo, jeżeli w pliku `views/partials/navbar.hbs` znajdzie się kod: 

*(Przykład 1)*<br>

```handlebars
<div class="navbar" style="display: flex; flex-direction: row; justify-content: space-between">
    <div class="navbar-left">
        {{#> navbar-left}}{{/navbar-left}}
    </div>
    <div class="navbar-right">
        {{#> navbar-right}}{{/navbar-right}}
    </div>
</div>
```
A w pliku `views/example1.hbs` znajdzie się kod:
```handlebars
{{#> partials/navbar}}
    {{#*inline "navbar-left"}}
        <a href="/">Home</a>
        <a href="/about">About</a>
    {{/inline}}
    {{#*inline "navbar-right"}}
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    {{/inline}}
{{/partials/navbar}}
```
W wyniku renderowania strony `example1.hbs` zostanie wygenerowany kod:
```html
<div class="navbar" style="display: flex; flex-direction: row; justify-content: space-between">
    <div class="navbar-left">
        <a href="/">Home</a>
        <a href="/about">About</a>
    </div>
    <div class="navbar-right">
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    </div>
</div>
```
W ten sposób możemy łatwo "dopisywać" kod do wnętrza partialsa, bez konieczności jego modyfikacji. 

*(Przykład 1)*<br>


---
*(Przykład 2)*<br>

Co więcej, jeżeli nie nadpiszemy navbar-right, zostanie użyta jego domyślna wartość — w tym wypadku pusta sekcja. Jeżeli w pliku `example2.hbs` umieścimy kod:
```handlebars
{{#> partials/navbar}}
    {{#*inline "navbar-left"}}
        <a href="/">Home</a>
        <a href="/about">About</a>
    {{/inline}}
{{/partials/navbar}}
```
W wyniku renderowania nie nastąpi żaden błąd, a kod wygenerowany przez handlebars będzie wyglądał następująco:
```html
<div class="navbar" style="display: flex; flex-direction: row; justify-content: space-between">
    <div class="navbar-left">
        <a href="/">Home</a>
        <a href="/about">About</a>
    </div>
    <div class="navbar-right">
    </div>
</div>
```
*(Przykład 2)*<br>

---

*(Przykład 3)*<br>

Wykorzystując ten mechanizm, możemy stworzyć całe layouty, które pozwolą na łatwe nadpisywanie ich domyślnych wartości. Na przykład, poprzez wpisanie w plik `views/layouts/example3.hbs` kodu:
```handlebars
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>
        {{#> title}}
            {{!-- Domyślny tytuł - może zostać nadpisany na każdej stronie --}}
            To jest domyślny tytuł
        {{/title}}
    </title>

    {{#> head}}
        {{!-- Dodatkowa zawartość head'a - <link>, <script> --}}
    {{/head}}
</head>
<body>
    {{#> body}}
        {{!-- Zawartość strony --}}
    {{/body}}
</body>
</html>
```
W pliku `views/example3.hbs` kodu:
```handlebars
{{#> layouts/example3}}
    {{#*inline "title"}}
        To jest zmieniony tytuł strony!
    {{/inline}}

    {{#*inline "head"}}
        <!-- Include bootstrap css -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
    {{/inline}}

    {{#*inline "body"}}
        <h1 class="badge bg-secondary">Example 3</h1>
        <p>
            To jest przykładowy tekst
        </p>
    {{/inline}}
{{/layouts/example3}}
```
Otrzymamy stronę:
```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>
        To jest zmieniony tytuł strony!
    </title>

    <!-- Include bootstrap css -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
    
    </head>
<body>
    <h1 class="badge bg-secondary">Example 3</h1>
    <p>
        To jest przykładowy tekst
    </p>
</body>
```  
*(Przykład 3)*<br>

---

*(Przykład 4)*<br>

Ten przykład wykorzystuje pliki:
- `views/layouts/example4.hbs`
- `views/example4.hbs`
- `views/example4b.hbs`

*(Przykład 4)*<br>

---

## Uruchomienie przykładu
Kod serwera znajduje się w pliku `index.js`, a widoki w katalogu `views`.
Aby uruchomić przykład, należy:
- Pobrać repozytorium
- Zainstalować moduły za pomocą `npm install`
- Uruchomić serwer za pomocą `npm start`
- Wejść na stronę `localhost:3000`