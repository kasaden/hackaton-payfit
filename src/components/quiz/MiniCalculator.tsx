"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface MiniCalculatorProps {
  type: "conges" | "heures"
  onComplete: (points: number) => void
}

export function MiniCalculator({ type, onComplete }: MiniCalculatorProps) {
  if (type === "conges") {
    return <CongesCalculator onComplete={onComplete} />
  }

  return <HeuresCalculator onComplete={onComplete} />
}

function CongesCalculator({
  onComplete,
}: {
  onComplete: (points: number) => void
}) {
  const [moisTravailles, setMoisTravailles] = useState<string>("")
  const [joursPris, setJoursPris] = useState<string>("")
  const [result, setResult] = useState<number | null>(null)

  const handleCalculate = () => {
    const mois = parseFloat(moisTravailles) || 0
    const pris = parseFloat(joursPris) || 0
    const remaining = mois * 2.5 - pris
    setResult(remaining)
  }

  const moisNum = parseFloat(moisTravailles) || 0
  const joursNum = parseFloat(joursPris) || 0
  const canCalculate = moisTravailles !== "" && joursPris !== ""

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Calculateur de congés payés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mois-travailles">Mois travaillés</Label>
            <Input
              id="mois-travailles"
              type="number"
              min={0}
              max={12}
              step={1}
              placeholder="0 - 12"
              value={moisTravailles}
              onChange={(e) => {
                const val = e.target.value
                if (val === "") {
                  setMoisTravailles("")
                  setResult(null)
                  return
                }
                const num = parseFloat(val)
                if (num >= 0 && num <= 12) {
                  setMoisTravailles(val)
                  setResult(null)
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jours-pris">Jours déjà pris</Label>
            <Input
              id="jours-pris"
              type="number"
              min={0}
              step={0.5}
              placeholder="0"
              value={joursPris}
              onChange={(e) => {
                const val = e.target.value
                if (val === "") {
                  setJoursPris("")
                  setResult(null)
                  return
                }
                const num = parseFloat(val)
                if (num >= 0) {
                  setJoursPris(val)
                  setResult(null)
                }
              }}
            />
          </div>
        </div>

        {canCalculate && (
          <button
            type="button"
            onClick={handleCalculate}
            className="text-sm font-medium text-[#0066CC] hover:underline"
          >
            Calculer le solde
          </button>
        )}

        {result !== null && (
          <div className="rounded-lg border bg-[#0066CC]/5 p-4">
            <p className="text-sm text-muted-foreground">Solde de congés restant :</p>
            <p className="mt-1 text-2xl font-bold text-[#0066CC]">
              {result.toFixed(1)} jours
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ({moisNum} mois x 2,5 jours) - {joursNum} jours pris = {result.toFixed(1)}{" "}
              jours
            </p>
          </div>
        )}

        <Button
          onClick={() => onComplete(3)}
          disabled={result === null}
          className="w-full bg-[#0066CC] hover:bg-[#0066CC]/90"
        >
          Valider
        </Button>
      </CardContent>
    </Card>
  )
}

function HeuresCalculator({
  onComplete,
}: {
  onComplete: (points: number) => void
}) {
  const [nbSalaries, setNbSalaries] = useState<string>("")
  const [heuresSup, setHeuresSup] = useState<string>("")
  const [result, setResult] = useState<{
    deduction: number
    rate: number
    isSmall: boolean
  } | null>(null)

  const handleCalculate = () => {
    const employees = parseFloat(nbSalaries) || 0
    const hours = parseFloat(heuresSup) || 0
    const isSmall = employees < 20
    const rate = isSmall ? 1.5 : 0.5
    const deduction = rate * hours
    setResult({ deduction, rate, isSmall })
  }

  const canCalculate = nbSalaries !== "" && heuresSup !== ""

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Calculateur heures supplémentaires
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nb-salaries">Nombre de salariés</Label>
            <Input
              id="nb-salaries"
              type="number"
              min={1}
              step={1}
              placeholder="Ex: 15"
              value={nbSalaries}
              onChange={(e) => {
                const val = e.target.value
                if (val === "") {
                  setNbSalaries("")
                  setResult(null)
                  return
                }
                const num = parseFloat(val)
                if (num >= 0) {
                  setNbSalaries(val)
                  setResult(null)
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heures-sup">Heures sup / mois</Label>
            <Input
              id="heures-sup"
              type="number"
              min={0}
              step={0.5}
              placeholder="Ex: 20"
              value={heuresSup}
              onChange={(e) => {
                const val = e.target.value
                if (val === "") {
                  setHeuresSup("")
                  setResult(null)
                  return
                }
                const num = parseFloat(val)
                if (num >= 0) {
                  setHeuresSup(val)
                  setResult(null)
                }
              }}
            />
          </div>
        </div>

        {canCalculate && (
          <button
            type="button"
            onClick={handleCalculate}
            className="text-sm font-medium text-[#0066CC] hover:underline"
          >
            Calculer la déduction
          </button>
        )}

        {result !== null && (
          <div className="rounded-lg border bg-[#0066CC]/5 p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Déduction forfaitaire patronale :
            </p>
            <p className="text-2xl font-bold text-[#0066CC]">
              {result.deduction.toFixed(2)} EUR / mois
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                Taux appliqué :{" "}
                <span className="font-semibold">
                  {result.rate.toFixed(2)} EUR / heure sup
                </span>
              </p>
              <p>
                {result.isSmall ? (
                  <>
                    Entreprise de moins de 20 salariés : déduction majorée de 1,50
                    EUR par heure supplémentaire.
                  </>
                ) : (
                  <>
                    Entreprise de 20 salariés ou plus : déduction de 0,50 EUR par
                    heure supplémentaire (taux étendu en 2026).
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={() => onComplete(3)}
          disabled={result === null}
          className="w-full bg-[#0066CC] hover:bg-[#0066CC]/90"
        >
          Valider
        </Button>
      </CardContent>
    </Card>
  )
}
