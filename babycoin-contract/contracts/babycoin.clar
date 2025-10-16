;; BabyCoin - A fun, simple fungible token
;; Implements SIP-010 Fungible Token Standard

(define-fungible-token babycoin)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))
(define-constant ERR_INVALID_RECIPIENT (err u103))

;; Token properties
(define-constant TOKEN_NAME "BabyCoin")
(define-constant TOKEN_SYMBOL "BABY")
(define-constant TOKEN_DECIMALS u6)
(define-constant TOKEN_MAX_SUPPLY u100000000000000) ;; 100M tokens with 6 decimals

;; Data variables
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var total-supply uint u0)

;; SIP-010 Functions

(define-read-only (get-name)
    (ok TOKEN_NAME)
)

(define-read-only (get-symbol)
    (ok TOKEN_SYMBOL)
)

(define-read-only (get-decimals)
    (ok TOKEN_DECIMALS)
)

(define-read-only (get-balance (who principal))
    (ok (ft-get-balance babycoin who))
)

(define-read-only (get-total-supply)
    (ok (var-get total-supply))
)

(define-read-only (get-token-uri)
    (ok (var-get token-uri))
)

(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
    (begin
        (asserts! (or (is-eq from tx-sender) (is-eq from contract-caller)) ERR_NOT_TOKEN_OWNER)
        (asserts! (not (is-eq to from)) ERR_INVALID_RECIPIENT)
        (ft-transfer? babycoin amount from to)
    )
)

;; Mint function - only contract owner can mint
(define-public (mint (amount uint) (to principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        (asserts! (<= (+ (var-get total-supply) amount) TOKEN_MAX_SUPPLY) (err u104))
        (try! (ft-mint? babycoin amount to))
        (var-set total-supply (+ (var-get total-supply) amount))
        (ok true)
    )
)

;; Burn function
(define-public (burn (amount uint))
    (begin
        (try! (ft-burn? babycoin amount tx-sender))
        (var-set total-supply (- (var-get total-supply) amount))
        (ok true)
    )
)

;; Set token URI - only owner
(define-public (set-token-uri (uri (string-utf8 256)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
        (var-set token-uri (some uri))
        (ok true)
    )
)

;; Initialize contract with initial mint to owner
(begin
    (try! (ft-mint? babycoin u10000000000 CONTRACT_OWNER)) ;; 10,000 BABY tokens initially
    (var-set total-supply u10000000000)
    (print "BabyCoin initialized with 10,000 tokens!")
)

;; title: babycoin
;; version:
;; summary:
;; description:

;; traits
;;

;; token definitions
;;

;; constants
;;

;; data vars
;;

;; data maps
;;

;; public functions
;;

;; read only functions
;;

;; private functions
;;

