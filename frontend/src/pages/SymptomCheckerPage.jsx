import { useState } from "react";
import DisclaimerBanner from "../components/DisclaimerBanner";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import { checkSymptoms } from "../services/assistantService";

const SymptomCheckerPage = () => {
  const [symptoms, setSymptoms] = useState("");
  const [followUpAnswers, setFollowUpAnswers] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      setResult(await checkSymptoms({ symptoms, followUpAnswers }));
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Could not analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Symptom Checker"
        subtitle="Describe symptoms and receive general educational guidance with follow-up questions."
      />
      <DisclaimerBanner />
      <form className="card space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Symptoms"
          as="textarea"
          placeholder="Example: fever, fatigue, headache, body pain"
          value={symptoms}
          onChange={(event) => setSymptoms(event.target.value)}
          required
        />
        <FormInput
          label="Follow-up details"
          as="textarea"
          placeholder="Optional: duration, temperature, any other details"
          value={followUpAnswers}
          onChange={(event) => setFollowUpAnswers(event.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? "Checking..." : "Check Symptoms"}
        </button>
      </form>

      {result ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="card">
            <h2 className="text-lg font-semibold">Follow-up Questions</h2>
            <div className="mt-3 space-y-3">
              {result.followUpQuestions.map((question, index) => (
                <div key={`${question}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {question}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold">Possible Conditions</h2>
            <div className="mt-3 space-y-3">
              {result.possibleConditions.map((condition, index) => (
                <div key={`${condition}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {condition}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="text-lg font-semibold">Advice</h2>
            <div className="mt-3 rounded-lg bg-primary-50 p-4 text-sm text-slate-700">
              {result.advice}
            </div>
            <p className="mt-3 text-sm text-primary-700">Estimated risk score: {result.riskScore}%</p>
            <div className="mt-3 space-y-2">
              {(result.riskFactors || []).map((factor, index) => (
                <div key={`${factor}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {factor}
                </div>
              ))}
            </div>
            {result.historicalContext ? (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                <span className="font-medium">Historical context</span>
                <div className="mt-1 whitespace-pre-line">{result.historicalContext}</div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default SymptomCheckerPage;
