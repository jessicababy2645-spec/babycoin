;; BabyBit SIP-010 fungible token implemented with ft- primitives

(define-trait sip010-ft-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-balance (principal) (response uint uint))
    (get-total-supply () (response (optional uint) uint))
    (get-name () (response (optional (string-ascii 32)) uint))
    (get-symbol () (response (optional (string-ascii 10)) uint))
    (get-decimals () (response (optional uint) uint))
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)


(define-fungible-token babybit)

(define-data-var owner (optional principal) none)
(define-data-var total-supply uint u0)
(define-data-var token-name (string-ascii 32) "BabyBit")
(define-data-var token-symbol (string-ascii 10) "BBIT")
(define-data-var token-decimals uint u6)
(define-data-var token-uri (optional (string-utf8 256)) none)

(define-constant ERR-NOT-INITIALIZED u100)
(define-constant ERR-ALREADY-INITIALIZED u101)
(define-constant ERR-NOT-AUTHORIZED u102)

(define-public (initialize)
  (if (is-some (var-get owner))
      (err ERR-ALREADY-INITIALIZED)
      (begin
        (var-set owner (some tx-sender))
        (ok true)
      )
  )
)

(define-read-only (get-owner)
  (ok (var-get owner))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (if (is-eq sender tx-sender)
      (match (ft-transfer? babybit amount sender recipient)
        okv (ok okv)
        errc (err errc)
      )
      (err ERR-NOT-AUTHORIZED)
  )
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance babybit who))
)

(define-read-only (get-total-supply)
  (ok (some (var-get total-supply)))
)

(define-read-only (get-name)
  (ok (some (var-get token-name)))
)

(define-read-only (get-symbol)
  (ok (some (var-get token-symbol)))
)

(define-read-only (get-decimals)
  (ok (some (var-get token-decimals)))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

(define-public (mint (recipient principal) (amount uint))
  (match (var-get owner) admin
    (if (is-eq admin tx-sender)
        (match (ft-mint? babybit amount recipient)
          okv (begin (var-set total-supply (+ (var-get total-supply) amount)) (ok okv))
          errc (err errc)
        )
        (err ERR-NOT-AUTHORIZED)
    )
    (err ERR-NOT-INITIALIZED)
  )
)

(define-public (burn (holder principal) (amount uint))
  (match (var-get owner) admin
    (if (is-eq admin tx-sender)
        (match (ft-burn? babybit amount holder)
          okv (begin (var-set total-supply (- (var-get total-supply) amount)) (ok okv))
          errc (err errc)
        )
        (err ERR-NOT-AUTHORIZED)
    )
    (err ERR-NOT-INITIALIZED)
  )
)
